from rest_framework import serializers
from .models import Notification
from accounts.serializers import UserSerializer


class NotificationSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    sender_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'sender', 'sender_avatar', 'recipient', 'notification_type',
                  'message', 'is_read', 'post', 'created_at']
        read_only_fields = ['recipient']

    def get_sender_avatar(self, obj):
        request = self.context.get('request')
        if obj.sender and hasattr(obj.sender, 'profile') and obj.sender.profile.avatar and request:
            return request.build_absolute_uri(obj.sender.profile.avatar.url)
        return None