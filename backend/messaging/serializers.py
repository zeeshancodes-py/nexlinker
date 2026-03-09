from rest_framework import serializers
from .models import Conversation, Message
from accounts.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    sender_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_avatar', 'content', 'is_read', 'created_at']
        read_only_fields = ['sender', 'is_read', 'conversation']

    def get_sender_avatar(self, obj):
        request = self.context.get('request')
        if hasattr(obj.sender, 'profile') and obj.sender.profile.avatar and request:
            return request.build_absolute_uri(obj.sender.profile.avatar.url)
        return None


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message_info = serializers.SerializerMethodField()
    other_participant = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'other_participant', 'last_message',
                  'last_message_at', 'last_message_info', 'unread_count', 'created_at']

    def get_other_participant(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        other = obj.participants.exclude(id=request.user.id).first()
        if other:
            data = UserSerializer(other).data
            if hasattr(other, 'profile'):
                req = self.context.get('request')
                data['headline'] = other.profile.headline
                data['avatar_url'] = req.build_absolute_uri(other.profile.avatar.url) if other.profile.avatar and req else None
            return data
        return None

    def get_last_message_info(self, obj):
        last = obj.messages.last()
        if last:
            return {'content': last.content, 'sender_name': last.sender.full_name, 'created_at': last.created_at}
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()