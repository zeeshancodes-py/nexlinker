from django.urls import path
from .views import (
    SendConnectionRequestView, RespondConnectionRequestView, WithdrawConnectionView,
    MyConnectionsView, PendingConnectionsView, SentConnectionsView,
    FollowUserView, PeopleYouMayKnowView
)

urlpatterns = [
    path('', MyConnectionsView.as_view(), name='my_connections'),
    path('pending/', PendingConnectionsView.as_view(), name='pending_connections'),
    path('sent/', SentConnectionsView.as_view(), name='sent_connections'),
    path('suggestions/', PeopleYouMayKnowView.as_view(), name='suggestions'),
    path('request/<uuid:user_id>/', SendConnectionRequestView.as_view(), name='send_request'),
    path('respond/<int:connection_id>/', RespondConnectionRequestView.as_view(), name='respond'),
    path('withdraw/<int:connection_id>/', WithdrawConnectionView.as_view(), name='withdraw'),
    path('follow/<uuid:user_id>/', FollowUserView.as_view(), name='follow'),
]