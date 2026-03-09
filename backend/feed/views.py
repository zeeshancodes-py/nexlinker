from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from .models import Post, Reaction, Comment
from .serializers import PostSerializer, ReactionSerializer, CommentSerializer
from notifications.utils import create_notification


class PostListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        from connections.models import Connection, Follow
        user = self.request.user
        # Get connected + followed users + self
        connected_ids = set()
        connected_ids.add(user.id)
        connections = Connection.objects.filter(
            (models.Q(sender=user) | models.Q(receiver=user)), status='accepted'
        )
        for conn in connections:
            connected_ids.add(conn.receiver_id if conn.sender == user else conn.sender_id)
        follows = Follow.objects.filter(follower=user).values_list('following_id', flat=True)
        connected_ids.update(follows)
        return Post.objects.filter(author_id__in=connected_ids)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


# Import models.Q
from django.db import models


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Post.objects.all()

    def perform_update(self, serializer):
        if serializer.instance.author != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only edit your own posts.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own posts.")
        instance.delete()


class ReactToPostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        reaction_type = request.data.get('reaction_type', 'like')
        existing = Reaction.objects.filter(user=request.user, post=post).first()

        if existing:
            if existing.reaction_type == reaction_type:
                existing.delete()
                post.likes_count = max(0, post.likes_count - 1)
                post.save()
                return Response({'detail': 'Reaction removed.', 'liked': False})
            else:
                existing.reaction_type = reaction_type
                existing.save()
                return Response({'detail': 'Reaction updated.', 'liked': True, 'reaction_type': reaction_type})
        else:
            Reaction.objects.create(user=request.user, post=post, reaction_type=reaction_type)
            post.likes_count += 1
            post.save()
            if post.author != request.user:
                create_notification(
                    recipient=post.author,
                    sender=request.user,
                    notification_type='reaction',
                    post=post,
                    message=f'{request.user.full_name} reacted to your post.'
                )
            return Response({'detail': 'Reaction added.', 'liked': True, 'reaction_type': reaction_type})


class CommentListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CommentSerializer

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comment.objects.filter(post_id=post_id, parent=None)

    def perform_create(self, serializer):
        post_id = self.kwargs['post_id']
        post = get_object_or_404(Post, id=post_id)
        comment = serializer.save(author=self.request.user, post=post)
        post.comments_count += 1
        post.save()
        if post.author != self.request.user:
            create_notification(
                recipient=post.author,
                sender=self.request.user,
                notification_type='comment',
                post=post,
                message=f'{self.request.user.full_name} commented on your post.'
            )


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CommentSerializer

    def get_queryset(self):
        return Comment.objects.all()

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()
        post = instance.post
        instance.delete()
        post.comments_count = max(0, post.comments_count - 1)
        post.save()


class UserPostsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostSerializer

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Post.objects.filter(author_id=user_id)