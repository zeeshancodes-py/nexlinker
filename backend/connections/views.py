from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db import models
from .models import Connection, Follow
from .serializers import ConnectionSerializer, FollowSerializer
from notifications.utils import create_notification
from profiles.models import Profile

User = get_user_model()


class SendConnectionRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        receiver = get_object_or_404(User, id=user_id)
        if receiver == request.user:
            return Response({'error': 'Cannot connect with yourself.'}, status=400)
        existing = Connection.objects.filter(
            models.Q(sender=request.user, receiver=receiver) |
            models.Q(sender=receiver, receiver=request.user)
        ).first()
        if existing:
            return Response({'error': f'Connection already {existing.status}.'}, status=400)
        message = request.data.get('message', '')
        conn = Connection.objects.create(sender=request.user, receiver=receiver, message=message)
        create_notification(
            recipient=receiver,
            sender=request.user,
            notification_type='connection_request',
            message=f'{request.user.full_name} sent you a connection request.'
        )
        return Response(ConnectionSerializer(conn, context={'request': request}).data, status=201)


class RespondConnectionRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, connection_id):
        conn = get_object_or_404(Connection, id=connection_id, receiver=request.user)
        action = request.data.get('action')
        if action == 'accept':
            conn.status = 'accepted'
            conn.save()
            # Update connection counts
            Profile.objects.filter(user=conn.sender).update(connections_count=models.F('connections_count') + 1)
            Profile.objects.filter(user=conn.receiver).update(connections_count=models.F('connections_count') + 1)
            create_notification(
                recipient=conn.sender,
                sender=request.user,
                notification_type='connection_accepted',
                message=f'{request.user.full_name} accepted your connection request.'
            )
        elif action == 'reject':
            conn.status = 'rejected'
            conn.save()
        else:
            return Response({'error': 'Invalid action.'}, status=400)
        return Response(ConnectionSerializer(conn, context={'request': request}).data)


class WithdrawConnectionView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, connection_id):
        conn = get_object_or_404(Connection, id=connection_id)
        if conn.sender != request.user and conn.receiver != request.user:
            return Response({'error': 'Not authorized.'}, status=403)
        if conn.status == 'accepted':
            Profile.objects.filter(user=conn.sender).update(connections_count=models.F('connections_count') - 1)
            Profile.objects.filter(user=conn.receiver).update(connections_count=models.F('connections_count') - 1)
        conn.delete()
        return Response({'detail': 'Connection removed.'})


class MyConnectionsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConnectionSerializer

    def get_queryset(self):
        user = self.request.user
        return Connection.objects.filter(
            (models.Q(sender=user) | models.Q(receiver=user)), status='accepted'
        )


class PendingConnectionsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConnectionSerializer

    def get_queryset(self):
        return Connection.objects.filter(receiver=self.request.user, status='pending')


class SentConnectionsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConnectionSerializer

    def get_queryset(self):
        return Connection.objects.filter(sender=self.request.user, status='pending')


class FollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        target = get_object_or_404(User, id=user_id)
        if target == request.user:
            return Response({'error': 'Cannot follow yourself.'}, status=400)
        follow, created = Follow.objects.get_or_create(follower=request.user, following=target)
        if created:
            Profile.objects.filter(user=request.user).update(following_count=models.F('following_count') + 1)
            Profile.objects.filter(user=target).update(followers_count=models.F('followers_count') + 1)
            create_notification(
                recipient=target,
                sender=request.user,
                notification_type='follow',
                message=f'{request.user.full_name} started following you.'
            )
            return Response({'detail': 'Following.'}, status=201)
        return Response({'detail': 'Already following.'})

    def delete(self, request, user_id):
        target = get_object_or_404(User, id=user_id)
        deleted, _ = Follow.objects.filter(follower=request.user, following=target).delete()
        if deleted:
            Profile.objects.filter(user=request.user).update(following_count=models.F('following_count') - 1)
            Profile.objects.filter(user=target).update(followers_count=models.F('followers_count') - 1)
        return Response({'detail': 'Unfollowed.'})


class PeopleYouMayKnowView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = None

    def list(self, request, *args, **kwargs):
        from profiles.serializers import ProfileListSerializer
        user = request.user
        connected_ids = list(Connection.objects.filter(
            (models.Q(sender=user) | models.Q(receiver=user))
        ).values_list('sender_id', 'receiver_id'))
        flat_ids = {uid for pair in connected_ids for uid in pair}
        flat_ids.add(user.id)
        profiles = Profile.objects.exclude(user_id__in=flat_ids).select_related('user')[:10]
        serializer = ProfileListSerializer(profiles, many=True, context={'request': request})
        return Response(serializer.data)