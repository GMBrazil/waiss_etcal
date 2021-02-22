from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class NewUserForm(UserCreationForm):
    first_name = forms.CharField(required = True, max_length=50)
    last_name = forms.CharField(required = True, max_length=50)
    email = forms.EmailField(required=True, max_length=200)
    class Meta:
        model = User
        fields = ("first_name", "last_name", "username", "email", "password1", "password2",)
        help_texts = {
            "username" : None,
            "password1" : None,
            "password2" : None
        }
    
    def save(self, commit=True):
        user = super(UserCreationForm, self).save(commit=False)
        user.first_name = self.cleaned_data["first_name"]
        user.last_name = self.cleaned_data["last_name"]
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user