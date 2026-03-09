from rest_framework import serializers
from .models import Post, Reaction, Comment
from accounts.serializers import UserSerializer


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    author_avatar = serializers.SerializerMethodField()
    author_headline = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'author', 'author_avatar', 'author_headline',
            'post', 'parent', 'content', 'created_at', 'updated_at',
            'likes_count', 'replies', 'is_liked'
        ]
        read_only_fields = ['author', 'likes_count']

    def get_author_avatar(self, obj):
        request = self.context.get('request')
        if hasattr(obj.author, 'profile') and obj.author.profile.avatar and request:
            return request.build_absolute_uri(obj.author.profile.avatar.url)
        return None

    def get_author_headline(self, obj):
        if hasattr(obj.author, 'profile'):
            return obj.author.profile.headline
        return ''

    def get_replies(self, obj):
        if obj.parent is None:
            replies = Comment.objects.filter(parent=obj)
            return CommentSerializer(replies, many=True, context=self.context).data
        return []

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return False  # Extend with CommentLike model if needed


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    author_avatar = serializers.SerializerMethodField()
    author_headline = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()
    top_comments = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'author_avatar', 'author_headline',
            'content', 'image', 'image_url', 'created_at', 'updated_at',
            'likes_count', 'comments_count', 'is_liked', 'user_reaction', 'top_comments'
        ]
        read_only_fields = ['author', 'likes_count', 'comments_count']

    def get_author_avatar(self, obj):
        request = self.context.get('request')
        if hasattr(obj.author, 'profile') and obj.author.profile.avatar and request:
            return request.build_absolute_uri(obj.author.profile.avatar.url)
        return None

    def get_author_headline(self, obj):
        if hasattr(obj.author, 'profile'):
            return obj.author.profile.headline
        return ''

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return Reaction.objects.filter(user=request.user, post=obj).exists()

    def get_user_reaction(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        reaction = Reaction.objects.filter(user=request.user, post=obj).first()
        return reaction.reaction_type if reaction else None

    def get_top_comments(self, obj):
        comments = Comment.objects.filter(post=obj, parent=None)[:3]
        return CommentSerializer(comments, many=True, context=self.context).data


class ReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reaction
        fields = ['id', 'user', 'post', 'reaction_type', 'created_at']
        read_only_fields = ['user']