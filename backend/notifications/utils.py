def create_notification(recipient, sender, notification_type, message, post=None):
    from .models import Notification
    notif = Notification.objects.create(
        recipient=recipient,
        sender=sender,
        notification_type=notification_type,
        message=message,
        post=post
    )
    # Send via WebSocket
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'notifications_{recipient.id}',
            {
                'type': 'send_notification',
                'notification': {
                    'id': notif.id,
                    'type': notification_type,
                    'message': message,
                    'sender_name': sender.full_name if sender else '',
                    'created_at': str(notif.created_at),
                    'is_read': False,
                }
            }
        )
    except Exception:
        pass
    return notif