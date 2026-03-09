from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

User = get_user_model()


class ConversationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer

    def get_queryset(self):
        return self.request.user.conversations.all()


class GetOrCreateConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        other_user = get_object_or_404(User, id=user_id)
        # Check if conversation exists
        existing = Conversation.objects.filter(
            participants=request.user
        ).filter(participants=other_user)
        if existing.exists():
            conv = existing.first()
        else:
            conv = Conversation.objects.create()
            conv.participants.add(request.user, other_user)
        return Response(ConversationSerializer(conv, context={'request': request}).data)


class MessageListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer

    def get_queryset(self):
        conv_id = self.kwargs['conversation_id']
        conv = get_object_or_404(Conversation, id=conv_id, participants=self.request.user)
        # Mark messages as read
        conv.messages.filter(is_read=False).exclude(sender=self.request.user).update(is_read=True)
        return conv.messages.all()


class SendMessageView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer

    def perform_create(self, serializer):
        conv_id = self.kwargs['conversation_id']
        conv = get_object_or_404(Conversation, id=conv_id, participants=self.request.user)
        msg = serializer.save(sender=self.request.user, conversation=conv)
        conv.last_message = msg.content
        conv.last_message_at = timezone.now()
        conv.save()