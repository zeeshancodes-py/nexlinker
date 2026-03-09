from rest_framework import serializers
from .models import Profile, Experience, Education, Skill, Certification
from accounts.serializers import UserSerializer


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = '__all__'
        read_only_fields = ['profile']
        extra_kwargs = {
            'end_date': {'allow_null': True, 'required': False},
        }
    
    def validate(self, data):
        # Handle optional end_date field - convert empty strings to None
        end_date = data.get('end_date')
        is_current = data.get('is_current', False)
        
        # Convert any empty value to None
        if end_date in ('', 'null', 'None', None):
            data['end_date'] = None
        
        # If is_current is True, force end_date to None
        if is_current:
            data['end_date'] = None
        
        return data


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'
        read_only_fields = ['profile']
        extra_kwargs = {
            'end_year': {'allow_null': True, 'required': False},
        }
    
    def validate(self, data):
        # Handle optional end_year field
        end_year = data.get('end_year')
        is_current = data.get('is_current', False)
        
        # Convert empty/zero/null values to None
        if end_year in ('', None, 0):
            data['end_year'] = None
        
        # If is_current is True, force end_year to None
        if is_current:
            data['end_year'] = None
        
        return data


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'
        read_only_fields = ['profile']


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = '__all__'
        read_only_fields = ['profile']
        extra_kwargs = {
            'issue_date': {'allow_null': True, 'required': False},
            'expiry_date': {'allow_null': True, 'required': False},
        }
    
    def validate(self, data):
        # Convert empty strings to None for optional date fields
        if data.get('issue_date') == '':
            data['issue_date'] = None
        if data.get('expiry_date') == '':
            data['expiry_date'] = None
        return data


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    educations = EducationSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    avatar_url = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()
    is_connected = serializers.SerializerMethodField()
    connection_status = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'headline', 'about', 'avatar', 'cover_image',
            'avatar_url', 'cover_image_url', 'location', 'website', 'phone',
            'open_status', 'followers_count', 'following_count', 'connections_count',
            'experiences', 'educations', 'skills', 'certifications',
            'is_connected', 'connection_status', 'is_following', 'created_at', 'updated_at',
        ]
        read_only_fields = ['user', 'followers_count', 'following_count', 'connections_count']

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None

    def get_cover_image_url(self, obj):
        request = self.context.get('request')
        if obj.cover_image and request:
            return request.build_absolute_uri(obj.cover_image.url)
        return None

    def get_is_connected(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        from connections.models import Connection
        return Connection.objects.filter(
            sender=request.user, receiver=obj.user, status='accepted'
        ).exists() or Connection.objects.filter(
            sender=obj.user, receiver=request.user, status='accepted'
        ).exists()

    def get_connection_status(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        if request.user == obj.user:
            return 'self'
        from connections.models import Connection
        conn = Connection.objects.filter(
            sender=request.user, receiver=obj.user
        ).first() or Connection.objects.filter(
            sender=obj.user, receiver=request.user
        ).first()
        if conn:
            return conn.status
        return 'none'

    def get_is_following(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        from connections.models import Follow
        return Follow.objects.filter(follower=request.user, following=obj.user).exists()


class ProfileListSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    avatar_url = serializers.SerializerMethodField()
    connection_status = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['id', 'user', 'headline', 'location', 'avatar_url', 'connections_count', 'connection_status']

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None

    def get_connection_status(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        if request.user == obj.user:
            return 'self'
        from connections.models import Connection
        conn = Connection.objects.filter(
            sender=request.user, receiver=obj.user
        ).first() or Connection.objects.filter(
            sender=obj.user, receiver=request.user
        ).first()
        return conn.status if conn else 'none'