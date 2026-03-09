from django.urls import path
from .views import NotificationListView, MarkReadView, MarkAllReadView, UnreadCountView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notifications'),
    path('unread-count/', UnreadCountView.as_view(), name='unread_count'),
    path('<int:pk>/read/', MarkReadView.as_view(), name='mark_read'),
    path('mark-all-read/', MarkAllReadView.as_view(), name='mark_all_read'),
]