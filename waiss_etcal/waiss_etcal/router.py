from django.conf import settings

class DatabaseAppsRouter(object):

    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'users':
            return 'usersdb'
        elif model._meta.app_label == 'contributors':
            return 'contributorsdb'
        return 'default'

    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'users':
            return 'usersdb'
        elif model._meta.app_label == 'contributors':
            return 'contributorsdb'
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        if obj1._meta.app_label == 'users' or obj2._meta.app_label == 'users':
            return True
        elif 'users' not in [obj1._meta.app_label, obj2._meta.app_label]:
            return True
        elif obj1._meta.app_label == 'contributors' or obj2._meta.app_label == 'contributors':
            return True
        elif 'contributors' not in [obj1._meta.app_label, obj2._meta.app_label]:
            return True
        return False

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label == 'users':
            return db == 'usersdb'
        elif app_label == 'contributors':
            return db == 'contributorsdb'
        return None