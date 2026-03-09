from rest_framework import serializers
from .models import Connection, Follow
from accounts.serializers import UserSerializer
from profiles.serializers import ProfileListSerializer


class ConnectionSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    sender_profile = serializers.SerializerMethodField()
    receiver_profile = serializers.SerializerMethodField()

    class Meta:
        model = Connection
        fields = ['id', 'sender', 'receiver', 'sender_profile', 'receiver_profile',
                  'status', 'message', 'created_at', 'updated_at']
        read_only_fields = ['sender', 'status']

    def get_sender_profile(self, obj):
        return ProfileListSerializer(obj.sender.profile, context=self.context).data

    def get_receiver_profile(self, obj):
        return ProfileListSerializer(obj.receiver.profile, context=self.context).data


class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']
        read_only_fields = ['follower']