/*
# Create Ingrido Core Schema (Django-compatible)

## Purpose
This migration creates the complete database schema for the Ingrido Pakistani recipe app.
The Django backend (deployed on Railway) will connect to this Supabase database as its primary data store.

## Tables Created

1. **recipes_city** — Pakistani cities (Karachi, Lahore, Islamabad, etc.)
2. **recipes_recipe** — Traditional recipes linked to cities
3. **recipes_aigeneratedrecipe** — AI-generated recipe cache (from Groq)
4. **generated_image_cache** — Cache for AI-generated dish images (Pollinations)
5. **account_user** — Custom Django user model (email-based auth)
6. **account_userprofile** — User health/dietary preferences + AI bookmarks
7. **account_savedrecipe** — Bookmarked recipes (FK to user + recipe)
8. **account_usersearchhistory** — User search history
9. **account_userviewedrecipe** — User viewed recipe history
10. **dashboard_viewed_history** — Dashboard viewed history (separate from account)
11. **dashboard_stats** — Per-user dashboard statistics
12. **meal_planner_savedmealplan** — AI-generated weekly meal plans

## Django Standard Tables
Django requires its own internal tables (auth_group, auth_permission, django_content_type,
django_session, django_migrations, authtoken_token, etc.) for the ORM to function.
These are also created here so `migrate` is not needed.

## Security
RLS is NOT enabled on these tables because access is controlled by the Django backend
(which connects as an authenticated database role). The frontend never talks to Supabase
directly — all requests go through the Django REST API.

## Notes
- All table names match Django's default naming convention (appname_modelname)
- BigAutoField primary keys (Django default)
- Timestamps use timestamptz
- JSON columns for flexible data (meal plans, preferences, recipe data)
*/

-- ============================================================
-- DJANGO INTERNAL TABLES (required for ORM)
-- ============================================================

CREATE TABLE IF NOT EXISTS django_migrations (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    app varchar(255) NOT NULL,
    name varchar(255) NOT NULL,
    applied timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS django_content_type (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    app_label varchar(100) NOT NULL,
    model varchar(100) NOT NULL,
    UNIQUE(app_label, model)
);

CREATE TABLE IF NOT EXISTS auth_group (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(150) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS auth_permission (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(255) NOT NULL,
    content_type_id bigint NOT NULL REFERENCES django_content_type(id) ON DELETE CASCADE,
    codename varchar(100) NOT NULL,
    UNIQUE(content_type_id, codename)
);

CREATE TABLE IF NOT EXISTS auth_group_permissions (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    group_id bigint NOT NULL REFERENCES auth_group(id) ON DELETE CASCADE,
    permission_id bigint NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE,
    UNIQUE(group_id, permission_id)
);

-- ============================================================
-- APP TABLES
-- ============================================================

-- recipes_city (City model)
CREATE TABLE IF NOT EXISTS recipes_city (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(100) NOT NULL UNIQUE,
    region varchar(100) NOT NULL,
    tagline varchar(255),
    latitude numeric(9,6),
    longitude numeric(9,6),
    is_pandamart_available boolean NOT NULL DEFAULT false,
    image varchar(100),
    famous_dishes jsonb DEFAULT '[]'::jsonb
);

-- recipes_recipe (Recipe model)
CREATE TABLE IF NOT EXISTS recipes_recipe (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title varchar(200) NOT NULL,
    description text NOT NULL DEFAULT 'No description provided',
    ingredients text NOT NULL DEFAULT 'No ingredients listed',
    instructions text NOT NULL DEFAULT 'No instructions provided',
    prep_time integer NOT NULL DEFAULT 0,
    calories integer NOT NULL DEFAULT 0,
    image varchar(100),
    cuisine varchar(100) NOT NULL DEFAULT 'Pakistani',
    dietary_type varchar(20) NOT NULL DEFAULT 'mixed' CHECK (dietary_type IN ('veg', 'non_veg', 'mixed')),
    spice_level varchar(20) NOT NULL DEFAULT 'Medium' CHECK (spice_level IN ('Mild', 'Medium', 'Hot')),
    estimated_protein integer NOT NULL DEFAULT 0,
    is_vegetarian boolean NOT NULL DEFAULT false,
    is_sugar_free boolean NOT NULL DEFAULT false,
    is_low_fat boolean NOT NULL DEFAULT false,
    city_id bigint REFERENCES recipes_city(id) ON DELETE CASCADE
);

-- recipes_aigeneratedrecipe (AIGeneratedRecipe model)
CREATE TABLE IF NOT EXISTS recipes_aigeneratedrecipe (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title varchar(255) NOT NULL UNIQUE,
    description text NOT NULL,
    ingredients text NOT NULL,
    instructions text NOT NULL,
    prep_time integer NOT NULL DEFAULT 30,
    kcal integer NOT NULL DEFAULT 350,
    cuisine varchar(100) NOT NULL DEFAULT 'Pakistani',
    dietary_type varchar(50) NOT NULL DEFAULT 'mixed',
    spice_level varchar(20) NOT NULL DEFAULT 'Medium',
    youtube_video_id varchar(50) NOT NULL DEFAULT '',
    image_url varchar(500) NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    view_count integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS recipes_aig_title_6735d7_idx ON recipes_aigeneratedrecipe (title);
CREATE INDEX IF NOT EXISTS recipes_aig_view_co_2b4125_idx ON recipes_aigeneratedrecipe (view_count DESC);

-- generated_image_cache
CREATE TABLE IF NOT EXISTS generated_image_cache (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    dish_name varchar(255) NOT NULL UNIQUE,
    image_url varchar(500) NOT NULL,
    image_path varchar(500) NOT NULL,
    prompt_used text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    last_accessed timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS generated_image_cache_dish_name_idx ON generated_image_cache (dish_name);

-- account_user (custom User model — extends AbstractUser)
CREATE TABLE IF NOT EXISTS account_user (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    password varchar(128) NOT NULL,
    last_login timestamptz,
    is_superuser boolean NOT NULL DEFAULT false,
    username varchar(150) NOT NULL UNIQUE,
    first_name varchar(150) NOT NULL DEFAULT '',
    last_name varchar(150) NOT NULL DEFAULT '',
    is_staff boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    date_joined timestamptz NOT NULL DEFAULT now(),
    email varchar(254) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS account_user_groups (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id bigint NOT NULL REFERENCES account_user(id) ON DELETE CASCADE,
    group_id bigint NOT NULL REFERENCES auth_group(id) ON DELETE CASCADE,
    UNIQUE(user_id, group_id)
);

CREATE TABLE IF NOT EXISTS account_user_user_permissions (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id bigint NOT NULL REFERENCES account_user(id) ON DELETE CASCADE,
    permission_id bigint NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE,
    UNIQUE(user_id, permission_id)
);

-- account_userprofile
CREATE TABLE IF NOT EXISTS account_userprofile (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    health_conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
    dietary_preferences jsonb NOT NULL DEFAULT '[]'::jsonb,
    ai_bookmarks jsonb NOT NULL DEFAULT '[]'::jsonb,
    user_id bigint NOT NULL UNIQUE REFERENCES account_user(id) ON DELETE CASCADE
);

-- account_savedrecipe
CREATE TABLE IF NOT EXISTS account_savedrecipe (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    saved_at timestamptz NOT NULL DEFAULT now(),
    recipe_id bigint NOT NULL REFERENCES recipes_recipe(id) ON DELETE CASCADE,
    user_id bigint NOT NULL REFERENCES account_user(id) ON DELETE CASCADE,
    image_url varchar(500),
    UNIQUE(user_id, recipe_id)
);

-- account_usersearchhistory
CREATE TABLE IF NOT EXISTS account_usersearchhistory (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    query varchar(200) NOT NULL,
    searched_at timestamptz NOT NULL DEFAULT now(),
    user_id bigint NOT NULL REFERENCES account_user(id) ON DELETE CASCADE,
    UNIQUE(user_id, query)
);

CREATE INDEX IF NOT EXISTS account_usersearchhistory_user_id_idx ON account_usersearchhistory (user_id);
CREATE INDEX IF NOT EXISTS account_usersearchhistory_searched_at_idx ON account_usersearchhistory (searched_at DESC);

-- account_userviewedrecipe
CREATE TABLE IF NOT EXISTS account_userviewedrecipe (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    recipe_id varchar(100) NOT NULL,
    recipe_title varchar(255) NOT NULL,
    recipe_data jsonb NOT NULL DEFAULT '{}'::jsonb,
    viewed_at timestamptz NOT NULL DEFAULT now(),
    user_id bigint NOT NULL REFERENCES account_user(id) ON DELETE CASCADE,
    UNIQUE(user_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS account_userviewedrecipe_user_id_idx ON account_userviewedrecipe (user_id);
CREATE INDEX IF NOT EXISTS account_userviewedrecipe_viewed_at_idx ON account_userviewedrecipe (viewed_at DESC);

-- dashboard_viewed_history
CREATE TABLE IF NOT EXISTS dashboard_viewed_history (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    recipe_id varchar(100) NOT NULL,
    recipe_title varchar(255) NOT NULL,
    recipe_data jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_ai_generated boolean NOT NULL DEFAULT false,
    viewed_at timestamptz NOT NULL DEFAULT now(),
    user_id bigint NOT NULL REFERENCES account_user(id) ON DELETE CASCADE,
    UNIQUE(user_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS dashboard_viewed_history_user_id_idx ON dashboard_viewed_history (user_id);
CREATE INDEX IF NOT EXISTS dashboard_viewed_history_viewed_at_idx ON dashboard_viewed_history (viewed_at DESC);

-- dashboard_stats
CREATE TABLE IF NOT EXISTS dashboard_stats (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    total_recipes_viewed integer NOT NULL DEFAULT 0,
    total_recipes_saved integer NOT NULL DEFAULT 0,
    last_active timestamptz NOT NULL DEFAULT now(),
    user_id bigint NOT NULL UNIQUE REFERENCES account_user(id) ON DELETE CASCADE
);

-- meal_planner_savedmealplan
CREATE TABLE IF NOT EXISTS meal_planner_savedmealplan (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    health_condition varchar(50) NOT NULL DEFAULT 'balanced' CHECK (health_condition IN ('diabetes', 'blood_pressure', 'heart_condition', 'balanced')),
    dietary_preference varchar(50) NOT NULL DEFAULT 'both' CHECK (dietary_preference IN ('veg', 'non_veg', 'both')),
    weekly_plan jsonb NOT NULL DEFAULT '[]'::jsonb,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    user_id bigint NOT NULL REFERENCES account_user(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS meal_planner_savedmealplan_user_id_idx ON meal_planner_savedmealplan (user_id);

-- authtoken_token (DRF Token Authentication)
CREATE TABLE IF NOT EXISTS authtoken_token (
    key varchar(40) NOT NULL PRIMARY KEY,
    user_id bigint NOT NULL UNIQUE REFERENCES account_user(id) ON DELETE CASCADE,
    created timestamptz NOT NULL DEFAULT now()
);

-- django_session
CREATE TABLE IF NOT EXISTS django_session (
    session_key varchar(40) NOT NULL PRIMARY KEY,
    session_data text NOT NULL,
    expire_date timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS django_session_expire_date_idx ON django_session (expire_date);

-- django_admin_log
CREATE TABLE IF NOT EXISTS django_admin_log (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    action_time timestamptz NOT NULL DEFAULT now(),
    object_id text,
    object_repr varchar(200) NOT NULL,
    action_flag smallint NOT NULL CHECK (action_flag >= 0),
    change_message text NOT NULL DEFAULT '',
    content_type_id bigint REFERENCES django_content_type(id) ON DELETE SET NULL,
    user_id bigint NOT NULL REFERENCES account_user(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS django_admin_log_content_type_id_idx ON django_admin_log (content_type_id);
CREATE INDEX IF NOT EXISTS django_admin_log_user_id_idx ON django_admin_log (user_id);