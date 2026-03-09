from django.urls import path
from .views import (
    PostListCreateView, PostDetailView, ReactToPostView,
    CommentListCreateView, CommentDetailView, UserPostsView
)

urlpatterns = [
    path('', PostListCreateView.as_view(), name='posts'),
    path('<int:pk>/', PostDetailView.as_view(), name='post_detail'),
    path('<int:post_id>/react/', ReactToPostView.as_view(), name='react_post'),
    path('<int:post_id>/comments/', CommentListCreateView.as_view(), name='comments'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment_detail'),
    path('user/<uuid:user_id>/', UserPostsView.as_view(), name='user_posts'),
]