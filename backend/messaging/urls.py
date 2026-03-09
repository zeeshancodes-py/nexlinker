from django.urls import path
from .views import ConversationListView, GetOrCreateConversationView, MessageListView, SendMessageView

urlpatterns = [
    path('conversations/', ConversationListView.as_view(), name='conversations'),
    path('conversations/with/<uuid:user_id>/', GetOrCreateConversationView.as_view(), name='get_or_create_conv'),
    path('conversations/<int:conversation_id>/messages/', MessageListView.as_view(), name='messages'),
    path('conversations/<int:conversation_id>/send/', SendMessageView.as_view(), name='send_message'),
]