--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: _realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA _realtime;


ALTER SCHEMA _realtime OWNER TO supabase_admin;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: pg_cron; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION pg_cron; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL';


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: supabase_functions; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA supabase_functions;


ALTER SCHEMA supabase_functions OWNER TO supabase_admin;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: hypopg; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS hypopg WITH SCHEMA extensions;


--
-- Name: EXTENSION hypopg; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION hypopg IS 'Hypothetical indexes for PostgreSQL';


--
-- Name: index_advisor; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS index_advisor WITH SCHEMA extensions;


--
-- Name: EXTENSION index_advisor; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION index_advisor IS 'Query index advisor';


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;


--
-- Name: EXTENSION pgjwt; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgjwt IS 'JSON Web Token API for Postgresql';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: postgres
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO postgres;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: postgres
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: postgres
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO postgres;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: postgres
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RAISE WARNING 'PgBouncer auth request: %', p_usename;

    RETURN QUERY
    SELECT usename::TEXT, passwd::TEXT FROM pg_catalog.pg_shadow
    WHERE usename = p_usename;
END;
$$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: add_job_to_approval_queue(); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.add_job_to_approval_queue() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Add job to approval queue
  INSERT INTO job_approval_queue (job_id, status)
  VALUES (NEW.id, 'pending');
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.add_job_to_approval_queue() OWNER TO supabase_admin;

--
-- Name: add_to_cart(uuid, uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_to_cart(user_uuid uuid, product_uuid uuid, item_quantity integer DEFAULT 1) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    cart_uuid UUID;
    cart_item_uuid UUID;
    product_price DECIMAL(10,2);
BEGIN
    -- Get or create cart
    SELECT get_or_create_cart(user_uuid) INTO cart_uuid;
    
    -- Get product price
    SELECT price INTO product_price 
    FROM public.products 
    WHERE id = product_uuid AND is_active = true;
    
    IF product_price IS NULL THEN
        RAISE EXCEPTION 'Product not found or inactive';
    END IF;
    
    -- Insert or update cart item
    INSERT INTO public.cart_items (cart_id, product_id, quantity, price)
    VALUES (cart_uuid, product_uuid, item_quantity, product_price)
    ON CONFLICT (cart_id, product_id) 
    DO UPDATE SET 
        quantity = cart_items.quantity + item_quantity,
        updated_at = timezone('utc'::text, now())
    RETURNING id INTO cart_item_uuid;
    
    RETURN cart_item_uuid;
END;
$$;


ALTER FUNCTION public.add_to_cart(user_uuid uuid, product_uuid uuid, item_quantity integer) OWNER TO postgres;

--
-- Name: award_daily_login_points(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.award_daily_login_points(user_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  today date := CURRENT_DATE;
  last_award date;
  points_category_id uuid;
BEGIN
  -- Get the points category for daily login
  SELECT id INTO points_category_id FROM points_categories WHERE name = 'daily_login' LIMIT 1;
  -- Get the last time this user got daily login points
  SELECT MAX(created_at)::date INTO last_award
  FROM transactions
  WHERE user_id = award_daily_login_points.user_id
    AND reason = 'Daily login reward';

  -- Only award if not already awarded today
  IF last_award IS NULL OR last_award < today THEN
    INSERT INTO transactions (user_id, amount, type, reason, status, created_at, category_id)
    VALUES (user_id, 10, 'earn', 'Daily login reward', 'completed', now(), points_category_id);
    -- Insert notification for the user
    INSERT INTO notifications (user_id, title, message, notification_type, priority, is_read, created_at)
    VALUES (user_id, 'Daily Login Reward', 'You earned 10 points for logging in today!', 'points_earned', 'normal', false, now());
  END IF;
END;
$$;


ALTER FUNCTION public.award_daily_login_points(user_id uuid) OWNER TO postgres;

--
-- Name: award_points_with_category(uuid, integer, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.award_points_with_category(p_user_id uuid, p_amount integer, p_category_name text, p_reason text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_category_id uuid;
  v_transaction_id uuid;
  v_template record;
  v_title text;
  v_message text;
BEGIN
  -- Get category ID
  SELECT id INTO v_category_id
  FROM points_categories
  WHERE name = p_category_name AND is_active = true;

  IF v_category_id IS NULL THEN
    RAISE EXCEPTION 'Category "%" not found or inactive', p_category_name;
  END IF;

  -- Create transaction
  INSERT INTO transactions (
    user_id,
    amount,
    type,
    reason,
    metadata,
    transaction_type,
    status,
    category_id,
    created_at
  ) VALUES (
    p_user_id,
    p_amount,
    'earn',
    COALESCE(p_reason, 'Points earned from ' || p_category_name),
    p_metadata,
    'points',
    'completed',
    v_category_id,
    NOW()
  ) RETURNING id INTO v_transaction_id;

  -- Update user's total points
  INSERT INTO points (user_id, total_points, total_earned, total_spent, last_updated)
  VALUES (p_user_id, p_amount, p_amount, 0, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = points.total_points + p_amount,
    total_earned = points.total_earned + p_amount,
    last_updated = NOW();

  -- Get notification template
  SELECT * INTO v_template
  FROM notification_templates
  WHERE name = 'points_earned' AND is_active = true;

  -- Replace template variables
  v_title := v_template.title_template;
  v_message := v_template.message_template;
  v_message := replace(v_message, '{{points}}', p_amount::text);
  v_message := replace(v_message, '{{reason}}', COALESCE(p_reason, p_category_name));

  -- Create notification
  INSERT INTO notifications (
    user_id,
    title,
    message,
    notification_type,
    priority,
    is_read,
    data,
    reference_id,
    reference_type,
    created_at
  ) VALUES (
    p_user_id,
    v_title,
    v_message,
    'points_earned',
    v_template.default_priority,
    false,
    jsonb_build_object(
      'points', p_amount,
      'transaction_id', v_transaction_id,
      'category', p_category_name,
      'reason', p_reason
    ) || p_metadata,
    v_transaction_id,
    'transaction',
    NOW()
  );

  RETURN v_transaction_id;
END;
$$;


ALTER FUNCTION public.award_points_with_category(p_user_id uuid, p_amount integer, p_category_name text, p_reason text, p_metadata jsonb) OWNER TO supabase_admin;

--
-- Name: begin_transaction(); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.begin_transaction() RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    transaction_id uuid;
BEGIN
    -- Create a new transaction record
    INSERT INTO public.transactions (
        id,
        transaction_type,
        type,
        status,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'system',
        'transaction',
        'pending',
        NOW(),
        NOW()
    )
    RETURNING id INTO transaction_id;

    RETURN transaction_id;
END;
$$;


ALTER FUNCTION public.begin_transaction() OWNER TO supabase_admin;

--
-- Name: broadcast_notification(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.broadcast_notification() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Broadcast to user's private channel
    PERFORM pg_notify(
        'notification_' || NEW.user_id::text,
        json_build_object(
            'id', NEW.id,
            'title', NEW.title,
            'message', NEW.message,
            'type', NEW.notification_type,
            'priority', NEW.priority,
            'data', NEW.data,
            'created_at', NEW.created_at
        )::text
    );
    
    -- Also broadcast to general notifications channel for online users
    PERFORM pg_notify(
        'notifications',
        json_build_object(
            'user_id', NEW.user_id,
            'notification', json_build_object(
                'id', NEW.id,
                'title', NEW.title,
                'message', NEW.message,
                'type', NEW.notification_type,
                'priority', NEW.priority,
                'data', NEW.data,
                'created_at', NEW.created_at
            )
        )::text
    );
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.broadcast_notification() OWNER TO postgres;

--
-- Name: cleanup_expired_notifications(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cleanup_expired_notifications() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM notifications 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
END;
$$;


ALTER FUNCTION public.cleanup_expired_notifications() OWNER TO postgres;

--
-- Name: cleanup_read_notifications(); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.cleanup_read_notifications() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Delete notifications that are marked as read and are older than 24 hours
    DELETE FROM notifications 
    WHERE is_read = true 
    AND read_at < NOW() - INTERVAL '24 hours';
END;
$$;


ALTER FUNCTION public.cleanup_read_notifications() OWNER TO supabase_admin;

--
-- Name: clear_cart(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clear_cart(user_uuid uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    cart_uuid UUID;
BEGIN
    -- Get user's active cart
    SELECT id INTO cart_uuid 
    FROM public.cart 
    WHERE user_id = user_uuid AND status = 'active';
    
    IF cart_uuid IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Delete all cart items
    DELETE FROM public.cart_items WHERE cart_id = cart_uuid;
    
    RETURN TRUE;
END;
$$;


ALTER FUNCTION public.clear_cart(user_uuid uuid) OWNER TO postgres;

--
-- Name: commit_transaction(); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.commit_transaction() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- In a real implementation, this would commit the transaction
    -- For now, we'll just return as the transaction is automatically committed
    -- when the function returns
    RETURN;
END;
$$;


ALTER FUNCTION public.commit_transaction() OWNER TO supabase_admin;

--
-- Name: create_missing_profiles(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_missing_profiles() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  user_record RECORD;
  created_count INTEGER := 0;
BEGIN
  -- Loop through users who don't have profiles
  FOR user_record IN 
    SELECT u.id, u.email, u.raw_user_meta_data, u.created_at
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE p.id IS NULL
  LOOP
    -- Create profile for this user
    INSERT INTO public.profiles (id, full_name, email, created_at, updated_at)
    VALUES (
      user_record.id,
      COALESCE(
        user_record.raw_user_meta_data->>'full_name', 
        user_record.raw_user_meta_data->>'name', 
        split_part(user_record.email, '@', 1)
      ),
      user_record.email,
      user_record.created_at,
      NOW()
    );
    
    -- Create points entry if it doesn't exist
    INSERT INTO public.points (user_id, total_points, total_earned, total_spent, last_updated)
    VALUES (
      user_record.id,
      0,
      0,
      0,
      NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    created_count := created_count + 1;
  END LOOP;
  
  RETURN created_count;
END;
$$;


ALTER FUNCTION public.create_missing_profiles() OWNER TO postgres;

--
-- Name: create_order_from_cart(uuid, jsonb, jsonb, text, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_order_from_cart(user_uuid uuid, shipping_addr jsonb DEFAULT NULL::jsonb, billing_addr jsonb DEFAULT NULL::jsonb, payment_method_val text DEFAULT NULL::text, points_to_use integer DEFAULT 0) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
DECLARE
    cart_uuid UUID;
    order_uuid UUID;
    order_num TEXT;
    cart_total DECIMAL(10,2);
    cart_item RECORD;
    user_points INTEGER;
    points_value DECIMAL(10,2);
    final_total DECIMAL(10,2);
BEGIN
    -- Get user's active cart
    SELECT id INTO cart_uuid 
    FROM public.cart 
    WHERE user_id = user_uuid AND status = 'active';
    
    IF cart_uuid IS NULL THEN
        RAISE EXCEPTION 'No active cart found';
    END IF;
    
    -- Calculate cart total
    SELECT COALESCE(SUM(quantity * price), 0) INTO cart_total
    FROM public.cart_items 
    WHERE cart_id = cart_uuid;
    
    IF cart_total = 0 THEN
        RAISE EXCEPTION 'Cart is empty';
    END IF;
    
    -- Check user points if points are being used
    IF points_to_use > 0 THEN
        SELECT COALESCE(SUM(amount), 0) INTO user_points
        FROM public.points 
        WHERE user_id = user_uuid;
        
        IF user_points < points_to_use THEN
            RAISE EXCEPTION 'Insufficient points';
        END IF;
        
        -- Assuming 1 point = $0.01 (adjust as needed)
        points_value := points_to_use * 0.01;
    ELSE
        points_value := 0;
    END IF;
    
    final_total := cart_total - points_value;
    
    -- Generate order number
    SELECT generate_order_number() INTO order_num;
    
    -- Create order
    INSERT INTO public.orders (
        user_id, 
        order_number, 
        total_amount, 
        subtotal, 
        discount_amount, 
        points_used,
        payment_method,
        shipping_address,
        billing_address
    )
    VALUES (
        user_uuid,
        order_num,
        final_total,
        cart_total,
        points_value,
        points_to_use,
        payment_method_val,
        shipping_addr,
        billing_addr
    )
    RETURNING id INTO order_uuid;
    
    -- Copy cart items to order items
    FOR cart_item IN 
        SELECT ci.*, p.title, p.description, p.image_url, p.seller_id
        FROM public.cart_items ci
        JOIN public.products p ON ci.product_id = p.id
        WHERE ci.cart_id = cart_uuid
    LOOP
        INSERT INTO public.order_items (
            order_id,
            product_id,
            quantity,
            unit_price,
            total_price,
            product_name,
            product_description,
            product_image_url,
            seller_id
        )
        VALUES (
            order_uuid,
            cart_item.product_id,
            cart_item.quantity,
            cart_item.price,
            cart_item.quantity * cart_item.price,
            cart_item.title,
            cart_item.description,
            cart_item.image_url,
            cart_item.seller_id
        );
    END LOOP;
    
    -- Deduct points if used
    IF points_to_use > 0 THEN
        INSERT INTO public.points (user_id, amount, description, transaction_type)
        VALUES (user_uuid, -points_to_use, 'Used for order ' || order_num, 'debit');
    END IF;
    
    -- Mark cart as converted
    UPDATE public.cart 
    SET status = 'converted', updated_at = timezone('utc'::text, now())
    WHERE id = cart_uuid;
    
    RETURN order_uuid;
END;
$_$;


ALTER FUNCTION public.create_order_from_cart(user_uuid uuid, shipping_addr jsonb, billing_addr jsonb, payment_method_val text, points_to_use integer) OWNER TO postgres;

--
-- Name: generate_avc_id(); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.generate_avc_id() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  new_id text;
BEGIN
  LOOP
    new_id := 'AVC-' || lpad(floor(random() * 1000000)::text, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE avc_id = new_id);
  END LOOP;
  RETURN new_id;
END;
$$;


ALTER FUNCTION public.generate_avc_id() OWNER TO supabase_admin;

--
-- Name: generate_order_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_order_number() RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
END;
$$;


ALTER FUNCTION public.generate_order_number() OWNER TO postgres;

--
-- Name: get_cart_item_count(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_cart_item_count(user_uuid uuid) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    item_count INTEGER;
BEGIN
    SELECT COALESCE(SUM(ci.quantity), 0) INTO item_count
    FROM public.cart c
    JOIN public.cart_items ci ON c.id = ci.cart_id
    WHERE c.user_id = user_uuid AND c.status = 'active';
    
    RETURN item_count;
END;
$$;


ALTER FUNCTION public.get_cart_item_count(user_uuid uuid) OWNER TO postgres;

--
-- Name: get_cart_total(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_cart_total(user_uuid uuid) RETURNS numeric
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    total DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(ci.quantity * ci.price), 0) INTO total
    FROM public.cart c
    JOIN public.cart_items ci ON c.id = ci.cart_id
    WHERE c.user_id = user_uuid AND c.status = 'active';
    
    RETURN total;
END;
$$;


ALTER FUNCTION public.get_cart_total(user_uuid uuid) OWNER TO postgres;

--
-- Name: get_category_id_by_name(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_category_id_by_name(category_name text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
  category_id UUID;
BEGIN
  SELECT id INTO category_id 
  FROM points_categories 
  WHERE name = category_name AND is_active = true;
  
  RETURN category_id;
END;
$$;


ALTER FUNCTION public.get_category_id_by_name(category_name text) OWNER TO postgres;

--
-- Name: get_category_points_stats(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_category_points_stats(p_category_name text) RETURNS TABLE(total_users bigint, total_points_earned bigint, total_points_spent bigint, average_points_per_user numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT t.user_id) as total_users,
    COALESCE(SUM(CASE WHEN t.type = 'earn' THEN t.amount ELSE 0 END), 0) as total_points_earned,
    COALESCE(SUM(CASE WHEN t.type = 'spend' THEN t.amount ELSE 0 END), 0) as total_points_spent,
    CASE 
      WHEN COUNT(DISTINCT t.user_id) > 0 THEN
        ROUND(COALESCE(SUM(CASE WHEN t.type = 'earn' THEN t.amount ELSE -t.amount END), 0)::NUMERIC / COUNT(DISTINCT t.user_id), 2)
      ELSE 0
    END as average_points_per_user
  FROM transactions t
  JOIN points_categories pc ON t.category_id = pc.id
  WHERE pc.name = p_category_name 
    AND t.transaction_type = 'points' 
    AND t.status = 'completed';
END;
$$;


ALTER FUNCTION public.get_category_points_stats(p_category_name text) OWNER TO postgres;

--
-- Name: get_or_create_cart(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_or_create_cart(user_uuid uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    cart_uuid UUID;
BEGIN
    -- Try to get existing active cart
    SELECT id INTO cart_uuid 
    FROM public.cart 
    WHERE user_id = user_uuid AND status = 'active';
    
    -- If no active cart exists, create one
    IF cart_uuid IS NULL THEN
        INSERT INTO public.cart (user_id, status)
        VALUES (user_uuid, 'active')
        RETURNING id INTO cart_uuid;
    END IF;
    
    RETURN cart_uuid;
END;
$$;


ALTER FUNCTION public.get_or_create_cart(user_uuid uuid) OWNER TO postgres;

--
-- Name: get_user_points_by_all_categories(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_points_by_all_categories(p_user_id uuid) RETURNS TABLE(user_id uuid, category_id uuid, category_name character varying, category_display_name character varying, category_icon character varying, category_color character varying, total_earned bigint, total_spent bigint, net_points bigint, transaction_count bigint, last_transaction_date timestamp with time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p_user_id as user_id,
    pc.id as category_id,
    pc.name as category_name,
    pc.display_name as category_display_name,
    pc.icon as category_icon,
    pc.color as category_color,
    COALESCE(SUM(CASE WHEN t.type = 'earn' THEN t.amount ELSE 0 END), 0) as total_earned,
    COALESCE(SUM(CASE WHEN t.type = 'spend' THEN t.amount ELSE 0 END), 0) as total_spent,
    COALESCE(SUM(CASE WHEN t.type = 'earn' THEN t.amount ELSE -t.amount END), 0) as net_points,
    COUNT(t.id) as transaction_count,
    MAX(t.created_at) as last_transaction_date
  FROM points_categories pc
  LEFT JOIN transactions t ON pc.id = t.category_id 
    AND t.user_id = p_user_id
    AND t.transaction_type = 'points' 
    AND t.status = 'completed'
  WHERE pc.is_active = true
  GROUP BY pc.id, pc.name, pc.display_name, pc.icon, pc.color  ORDER BY net_points DESC;
END;
$$;


ALTER FUNCTION public.get_user_points_by_all_categories(p_user_id uuid) OWNER TO postgres;

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    created_at,
    updated_at,
    avc_id
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    NOW(),
    NOW(),
    'AVC' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create points entry
  INSERT INTO public.points (
    user_id,
    total_points,
    total_earned,
    total_spent,
    last_updated
  )
  VALUES (
    NEW.id,
    0,
    0,
    0,
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Create notification settings
  INSERT INTO public.notification_settings (
    user_id,
    email_notifications,
    push_notifications,
    sms_notifications,
    marketing_emails,
    receive_newsletters,
    get_ekart_notifications,
    stay_updated_on_jobs,
    get_trending_community_posts
  )
  VALUES (
    NEW.id,
    true,
    true,
    false,
    true,
    true,
    true,
    true,
    true
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Create profile completion entry
  INSERT INTO public.profile_completion (
    user_id,
    basic_details,
    employment,
    certifications,
    address,
    social_links,
    completion_percentage,
    updated_at
  )
  VALUES (
    NEW.id,
    false,
    false,
    false,
    false,
    false,
    0,
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--
-- Name: initialize_user_notification_settings(); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.initialize_user_notification_settings() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.initialize_user_notification_settings() OWNER TO supabase_admin;

--
-- Name: initialize_user_points(); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.initialize_user_points() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO points (user_id, total_points, total_earned, total_spent)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.initialize_user_points() OWNER TO supabase_admin;

--
-- Name: jobs_fts_trigger(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.jobs_fts_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.fts := to_tsvector('english', coalesce(NEW.title,'') || ' ' || coalesce(NEW.description,'') || ' ' || coalesce(NEW.company,''));
  RETURN NEW;
END
$$;


ALTER FUNCTION public.jobs_fts_trigger() OWNER TO postgres;

--
-- Name: notify_admins_on_event_request(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_admins_on_event_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  organizer_name text;
BEGIN
  -- Fetch organizer name from profiles table
  SELECT full_name INTO organizer_name FROM profiles WHERE id = NEW.requested_by;

  INSERT INTO notifications (
    user_id,
    notification_type,
    title,
    message,
    data
  )
  SELECT 
    u.id,
    'event_request',
    'New Event Request',
    format('New event request from %s: %s', COALESCE(organizer_name, 'Unknown'), NEW.title),
    jsonb_build_object(
      'event_id', NEW.id,
      'event_title', NEW.title,
      'organizer_name', organizer_name
    )
  FROM auth.users u
  WHERE u.role = 'admin';

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_admins_on_event_request() OWNER TO postgres;

--
-- Name: notify_admins_on_job_post(); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.notify_admins_on_job_post() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  poster_name TEXT;
  poster_email TEXT;
  admin_id UUID;
  admin_email TEXT;
BEGIN
  -- Get poster profile information with explicit column selection
  SELECT public.profiles.full_name, public.profiles.email 
  INTO poster_name, poster_email
  FROM public.profiles
  WHERE public.profiles.id = NEW.posted_by;
  
  -- Send notification to each admin individually
  FOR admin_id, admin_email IN 
    SELECT public.profiles.id, public.profiles.email
    FROM public.profiles 
    WHERE public.profiles.is_admin = true
  LOOP
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      notification_type,
      priority,
      data,
      reference_id,
      reference_type
    )
    VALUES (
      admin_id,
      'New Job Posting Requires Approval',
      'A new job posting "' || NEW.title || '" by ' || 
      COALESCE(poster_name, 'Unknown User') || 
      ' (' || COALESCE(poster_email, 'No email') || ') requires admin approval.',
      'job_posted',
      'high',
      jsonb_build_object(
        'job_title', NEW.title,
        'poster_name', COALESCE(poster_name, 'Unknown User'),
        'poster_email', COALESCE(poster_email, 'No email'),
        'job_id', NEW.id
      ),
      NEW.id,
      'job'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_admins_on_job_post() OWNER TO supabase_admin;

--
-- Name: notify_all_on_new_product(); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.notify_all_on_new_product() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    notification_type,
    title,
    message,
    data
  )
  SELECT 
    id,
    'announcement',
    'New Product Posted',
    'A new product has been posted: ' || NEW.title,
    jsonb_build_object(
      'product_id', NEW.id,
      'product_title', NEW.title,
      'seller_id', NEW.seller_id
    )
  FROM profiles 
  WHERE id != NEW.seller_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_all_on_new_product() OWNER TO supabase_admin;

--
-- Name: notify_bookmarkers_on_reply(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_bookmarkers_on_reply() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    notification_type,
    title,
    message,
    data
  )
  SELECT 
    b.user_id,
    'discussion_reply',
    'New Reply in Bookmarked Discussion',
    format('New reply in discussion: %s', d.title),
    jsonb_build_object(
      'discussion_id', d.id,
      'discussion_title', d.title,
      'reply_id', NEW.id
    )
  FROM discussion_bookmarks b
  JOIN discussions d ON d.id = b.discussion_id
  WHERE b.discussion_id = NEW.discussion_id
  AND b.user_id != NEW.author_id;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_bookmarkers_on_reply() OWNER TO postgres;

--
-- Name: notify_buyer_on_order(); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.notify_buyer_on_order() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  product_titles TEXT[];
  product_ids UUID[];
  order_total NUMERIC;
  order_number TEXT;
  v_title_template TEXT;
  v_message_template TEXT;
  title TEXT;
  message TEXT;
BEGIN
  SELECT array_agg(p.title), array_agg(oi.product_id)
    INTO product_titles, product_ids
  FROM order_items oi
  JOIN products p ON oi.product_id = p.id
  WHERE oi.order_id = NEW.id;

  -- Get order total and order number
  SELECT o.total_amount, o.order_number INTO order_total, order_number FROM orders o WHERE o.id = NEW.id;

  -- Fetch template
  SELECT nt.title_template, nt.message_template
    INTO v_title_template, v_message_template
  FROM notification_templates nt
  WHERE nt.notification_type = 'order_placed' AND nt.is_active = true
  LIMIT 1;

  -- Replace variables in template
  title := replace(v_title_template, '{{order_id}}', order_number);
  message := replace(v_message_template, '{{order_id}}', order_number);
  message := replace(message, '{{total_amount}}', COALESCE(order_total::text, '0'));

  INSERT INTO notifications (
    user_id,
    notification_type,
    title,
    message,
    data
  )
  VALUES (
    NEW.user_id,
    'order_placed',
    title,
    message,
    jsonb_build_object(
      'order_id', NEW.id,
      'order_number', order_number,
      'product_ids', product_ids,
      'product_titles', product_titles,
      'total_amount', order_total
    )
  );
  RETURN NULL;
END;
$$;


ALTER FUNCTION public.notify_buyer_on_order() OWNER TO supabase_admin;

--
-- Name: notify_buyer_on_status_update(); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.notify_buyer_on_status_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  buyer_id uuid;
  product_title text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    SELECT user_id INTO buyer_id FROM orders WHERE id = NEW.id;
    SELECT title INTO product_title 
    FROM products 
    WHERE id = (SELECT product_id FROM order_items WHERE order_id = NEW.id LIMIT 1);

    INSERT INTO notifications (
      user_id,
      notification_type,
      title,
      message,
      data
    )
    VALUES (
      buyer_id,
      'product_status_update',
      'Order Status Updated',
      'Status of your order for "' || product_title || '" updated to: ' || NEW.status,
      jsonb_build_object(
        'order_id', NEW.id,
        'status', NEW.status,
        'product_title', product_title
      )
    );
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_buyer_on_status_update() OWNER TO supabase_admin;

--
-- Name: notify_job_poster_on_approval_change(); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.notify_job_poster_on_approval_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  job_record RECORD;
BEGIN
  -- Only trigger when approval status changes
  IF OLD.status != NEW.status THEN
    -- Get job details
    SELECT * INTO job_record FROM jobs WHERE id = NEW.job_id;
    
    -- Send notification to job poster
    INSERT INTO notifications (
      user_id,
      title,
      message,
      notification_type,
      priority,
      data,
      reference_id,
      reference_type
    )
    VALUES (
      job_record.posted_by,
      'Job Posting ' || INITCAP(NEW.status),
      'Your job posting "' || job_record.title || '" has been ' || NEW.status ||
      CASE WHEN NEW.status = 'rejected' AND NEW.rejection_reason IS NOT NULL
           THEN '. Reason: ' || NEW.rejection_reason
           ELSE '.'
      END,
      'job_approval_status',
      'normal',
      jsonb_build_object(
        'job_title', job_record.title,
        'status', NEW.status,
        'rejection_reason', COALESCE(NEW.rejection_reason, '')
      ),
      NEW.job_id,
      'job'
    );
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_job_poster_on_approval_change() OWNER TO supabase_admin;

--
-- Name: notify_sellers_on_order(); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.notify_sellers_on_order() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  seller_row RECORD;
  order_number TEXT;
  order_total NUMERIC;
  v_title_template TEXT;
  v_message_template TEXT;
  title TEXT;
  message TEXT;
BEGIN
  -- Get order number and total
  SELECT o.order_number, o.total_amount INTO order_number, order_total FROM orders o WHERE o.id = NEW.order_id;

  -- For each seller in the order, create a notification
  FOR seller_row IN
    SELECT seller_id, array_agg(product_title) AS titles, array_agg(product_id) AS product_ids
    FROM (
      SELECT oi.seller_id, p.title AS product_title, oi.product_id
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = NEW.order_id
    ) sub
    GROUP BY seller_id
  LOOP
    -- Fetch template
    SELECT nt.title_template, nt.message_template
      INTO v_title_template, v_message_template
    FROM notification_templates nt
    WHERE nt.notification_type = 'product_purchased' AND nt.is_active = true
    LIMIT 1;

    -- Replace variables in template
    title := replace(v_title_template, '{{order_number}}', order_number);
    message := replace(v_message_template, '{{order_number}}', order_number);
    message := replace(message, '{{total_amount}}', COALESCE(order_total::text, '0'));

    -- Debug logs
    RAISE NOTICE 'notify_sellers_on_order: notification_type=product_purchased, title=%, message=%, data=%', title, message, jsonb_build_object(
      'order_id', NEW.order_id,
      'order_number', order_number,
      'product_ids', seller_row.product_ids,
      'product_titles', seller_row.titles,
      'total_amount', order_total
    );

    INSERT INTO notifications (
      user_id,
      notification_type,
      title,
      message,
      data
    )
    VALUES (
      seller_row.seller_id,
      'product_purchased',
      title,
      message,
      jsonb_build_object(
        'order_id', NEW.order_id,
        'order_number', order_number,
        'product_ids', seller_row.product_ids,
        'product_titles', seller_row.titles,
        'total_amount', order_total
      )
    );
  END LOOP;
  RETURN NULL;
END;
$$;


ALTER FUNCTION public.notify_sellers_on_order() OWNER TO supabase_admin;

--
-- Name: notify_user_on_event_status_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_user_on_event_status_change() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (
      user_id,
      notification_type,
      title,
      message,
      metadata
    )
    VALUES (
      NEW.organizer_id,
      'event_status_update',
      'Event Status Updated',
      format('Your event "%s" status has been updated to: %s', NEW.title, NEW.status),
      jsonb_build_object(
        'event_id', NEW.id,
        'event_title', NEW.title,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_user_on_event_status_change() OWNER TO postgres;

--
-- Name: populate_sample_products(); Type: FUNCTION; Schema: public; Owner: postgres
--


CREATE FUNCTION public.rollback_transaction() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- In a real implementation, this would rollback the transaction
    -- For now, we'll just return as the transaction is automatically rolled back
    -- when an error occurs
    RETURN;
END;
$$;


ALTER FUNCTION public.rollback_transaction() OWNER TO supabase_admin;

--
-- Name: set_avc_id_on_insert(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_avc_id_on_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.avc_id IS NULL THEN
    NEW.avc_id := generate_avc_id();
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_avc_id_on_insert() OWNER TO postgres;

--
-- Name: set_has_business_card_true(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_has_business_card_true() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Only update if the transaction is for the business card and is completed
  IF (NEW.reason = 'Purchased tool: Business Card' AND NEW.status = 'completed') THEN
    UPDATE public.profiles
    SET has_business_card = TRUE, updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_has_business_card_true() OWNER TO postgres;

--
-- Name: spend_points_with_category(uuid, integer, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.spend_points_with_category(p_user_id uuid, p_amount integer, p_category_name text, p_reason text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_category_id uuid;
  v_points_id uuid;
  v_notification_id uuid;
  v_current_points bigint;
BEGIN
  -- Get category ID
  SELECT id INTO v_category_id
  FROM categories
  WHERE name = p_category_name;

  IF v_category_id IS NULL THEN
    RAISE EXCEPTION 'Category % not found', p_category_name;
  END IF;

  -- Check if user has enough points
  SELECT COALESCE(SUM(amount), 0) INTO v_current_points
  FROM points
  WHERE user_id = p_user_id AND category_id = v_category_id;

  IF v_current_points < p_amount THEN
    RAISE EXCEPTION 'Insufficient points in category %', p_category_name;
  END IF;

  -- Insert points record (negative amount for spending)
  INSERT INTO points (
    user_id,
    category_id,
    amount,
    reason,
    metadata
  ) VALUES (
    p_user_id,
    v_category_id,
    -p_amount,
    p_reason,
    p_metadata
  ) RETURNING id INTO v_points_id;

  -- Create notification
  INSERT INTO notifications (
    user_id,
    notification_type,
    title,
    message,
    metadata
  ) VALUES (
    p_user_id,
    COALESCE(p_metadata->>'notification_type', 'points_spent'),
    'Points Spent',
    CASE 
      WHEN p_reason IS NOT NULL THEN format('You spent %s points for %s', p_amount, p_reason)
      ELSE format('You spent %s points', p_amount)
    END,
    jsonb_build_object(
      'points_id', v_points_id,
      'amount', p_amount,
      'category', p_category_name,
      'reason', p_reason
    ) || p_metadata
  ) RETURNING id INTO v_notification_id;

  RETURN v_points_id;
END;
$$;


ALTER FUNCTION public.spend_points_with_category(p_user_id uuid, p_amount integer, p_category_name text, p_reason text, p_metadata jsonb) OWNER TO postgres;

--
-- Name: trigger_award_daily_login_points_fn(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_award_daily_login_points_fn() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.last_login IS DISTINCT FROM OLD.last_login THEN
    PERFORM award_daily_login_points(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.trigger_award_daily_login_points_fn() OWNER TO postgres;

--
-- Name: update_cart_quantity(uuid, uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_cart_quantity(user_uuid uuid, product_uuid uuid, new_quantity integer) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    cart_uuid UUID;
BEGIN
    -- Get user's active cart
    SELECT id INTO cart_uuid 
    FROM public.cart 
    WHERE user_id = user_uuid AND status = 'active';
    
    IF cart_uuid IS NULL THEN
        RETURN FALSE;
    END IF;
    
    IF new_quantity <= 0 THEN
        -- Remove item if quantity is 0 or negative
        DELETE FROM public.cart_items 
        WHERE cart_id = cart_uuid AND product_id = product_uuid;
    ELSE
        -- Update quantity
        UPDATE public.cart_items 
        SET quantity = new_quantity, updated_at = timezone('utc'::text, now())
        WHERE cart_id = cart_uuid AND product_id = product_uuid;
    END IF;
    
    RETURN TRUE;
END;
$$;


ALTER FUNCTION public.update_cart_quantity(user_uuid uuid, product_uuid uuid, new_quantity integer) OWNER TO postgres;

--
-- Name: update_category_counts(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_category_counts() RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    category_record RECORD;
    product_count INTEGER;
BEGIN
    -- Get all categories
    FOR category_record IN SELECT name FROM public.product_categories
    LOOP
        -- Count products in this category
        IF category_record.name = 'All' THEN
            SELECT COUNT(*) INTO product_count FROM public.products WHERE is_active = true;
        ELSE
            SELECT COUNT(*) INTO product_count FROM public.products 
            WHERE category = category_record.name AND is_active = true;
        END IF;
        
        -- Update the description to include the count
        UPDATE public.product_categories
        SET description = 'Contains ' || product_count || ' products'
        WHERE name = category_record.name;
    END LOOP;
END;
$$;


ALTER FUNCTION public.update_category_counts() OWNER TO postgres;

--
-- Name: update_discussion_counters(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_discussion_counters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update comment count
        IF NEW.discussion_id IS NOT NULL THEN
            UPDATE discussions 
            SET comment_count = comment_count + 1,
                last_activity_at = NOW()
            WHERE id = NEW.discussion_id;
        END IF;
        
        -- Update reply count for parent comment
        IF NEW.parent_id IS NOT NULL THEN
            UPDATE discussion_comments 
            SET reply_count = reply_count + 1
            WHERE id = NEW.parent_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update comment count
        IF OLD.discussion_id IS NOT NULL THEN
            UPDATE discussions 
            SET comment_count = comment_count - 1
            WHERE id = OLD.discussion_id;
        END IF;
        
        -- Update reply count for parent comment
        IF OLD.parent_id IS NOT NULL THEN
            UPDATE discussion_comments 
            SET reply_count = reply_count - 1
            WHERE id = OLD.parent_id;
        END IF;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.update_discussion_counters() OWNER TO postgres;

--
-- Name: update_notifications_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_notifications_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_notifications_updated_at() OWNER TO postgres;

--
-- Name: update_points_from_transaction(); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.update_points_from_transaction() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Only process completed point transactions
    IF NEW.transaction_type = 'points' AND NEW.status = 'completed' THEN
        -- Handle INSERT
        IF (TG_OP = 'INSERT') THEN
            INSERT INTO points (user_id, total_points, total_earned, total_spent, category, last_updated)
            VALUES (
                NEW.user_id,
                CASE WHEN NEW.type = 'earn' THEN NEW.amount ELSE -NEW.amount END,
                CASE WHEN NEW.type = 'earn' THEN NEW.amount ELSE 0 END,
                CASE WHEN NEW.type = 'spend' THEN NEW.amount ELSE 0 END,
                NEW.category_id,
                NOW()
            )
            ON CONFLICT (user_id) DO UPDATE SET
                total_points = points.total_points + 
                    CASE WHEN NEW.type = 'earn' THEN NEW.amount ELSE -NEW.amount END,
                total_earned = points.total_earned + 
                    CASE WHEN NEW.type = 'earn' THEN NEW.amount ELSE 0 END,
                total_spent = points.total_spent + 
                    CASE WHEN NEW.type = 'spend' THEN NEW.amount ELSE 0 END,
                category = NEW.category_id,
                last_updated = NOW();
        
        -- Handle UPDATE
        ELSIF (TG_OP = 'UPDATE') THEN
            -- If status changed from something else to completed
            IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
                UPDATE points SET
                    total_points = total_points + 
                        CASE WHEN NEW.type = 'earn' THEN NEW.amount ELSE -NEW.amount END,
                    total_earned = total_earned + 
                        CASE WHEN NEW.type = 'earn' THEN NEW.amount ELSE 0 END,
                    total_spent = total_spent + 
                        CASE WHEN NEW.type = 'spend' THEN NEW.amount ELSE 0 END,
                    category = NEW.category_id,
                    last_updated = NOW()
                WHERE user_id = NEW.user_id;
            
            -- If status changed from completed to something else
            ELSIF OLD.status = 'completed' AND NEW.status != 'completed' THEN
                UPDATE points SET
                    total_points = total_points - 
                        CASE WHEN OLD.type = 'earn' THEN OLD.amount ELSE -OLD.amount END,
                    total_earned = total_earned - 
                        CASE WHEN OLD.type = 'earn' THEN OLD.amount ELSE 0 END,
                    total_spent = total_spent - 
                        CASE WHEN OLD.type = 'spend' THEN OLD.amount ELSE 0 END,
                    last_updated = NOW()
                WHERE user_id = OLD.user_id;
            
            -- If amount or type changed while status is completed
            ELSIF OLD.status = 'completed' AND NEW.status = 'completed' AND 
                  (OLD.amount != NEW.amount OR OLD.type != NEW.type) THEN
                UPDATE points SET
                    total_points = total_points - 
                        CASE WHEN OLD.type = 'earn' THEN OLD.amount ELSE -OLD.amount END +
                        CASE WHEN NEW.type = 'earn' THEN NEW.amount ELSE -NEW.amount END,
                    total_earned = total_earned - 
                        CASE WHEN OLD.type = 'earn' THEN OLD.amount ELSE 0 END +
                        CASE WHEN NEW.type = 'earn' THEN NEW.amount ELSE 0 END,
                    total_spent = total_spent - 
                        CASE WHEN OLD.type = 'spend' THEN OLD.amount ELSE 0 END +
                        CASE WHEN NEW.type = 'spend' THEN NEW.amount ELSE 0 END,
                    category = NEW.category_id,
                    last_updated = NOW()
                WHERE user_id = NEW.user_id;
            END IF;
        
        -- Handle DELETE
        ELSIF (TG_OP = 'DELETE') AND OLD.status = 'completed' THEN
            UPDATE points SET
                total_points = total_points - 
                    CASE WHEN OLD.type = 'earn' THEN OLD.amount ELSE -OLD.amount END,
                total_earned = total_earned - 
                    CASE WHEN OLD.type = 'earn' THEN OLD.amount ELSE 0 END,
                total_spent = total_spent - 
                    CASE WHEN OLD.type = 'spend' THEN OLD.amount ELSE 0 END,
                last_updated = NOW()
            WHERE user_id = OLD.user_id;
        END IF;
    END IF;
    
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.update_points_from_transaction() OWNER TO supabase_admin;

--
-- Name: update_poll_vote_counts(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_poll_vote_counts() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update option vote count
        UPDATE discussion_poll_options 
        SET vote_count = vote_count + 1
        WHERE id = NEW.option_id;
        
        -- Update total poll votes
        UPDATE discussion_polls 
        SET total_votes = total_votes + 1
        WHERE id = NEW.poll_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update option vote count
        UPDATE discussion_poll_options 
        SET vote_count = vote_count - 1
        WHERE id = OLD.option_id;
        
        -- Update total poll votes
        UPDATE discussion_polls 
        SET total_votes = total_votes - 1
        WHERE id = OLD.poll_id;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.update_poll_vote_counts() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- Name: update_vote_scores(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_vote_scores() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Update discussion vote score
        IF NEW.discussion_id IS NOT NULL THEN
            UPDATE discussions 
            SET vote_score = (
                SELECT COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE -1 END), 0)
                FROM discussion_votes 
                WHERE discussion_id = NEW.discussion_id
            )
            WHERE id = NEW.discussion_id;
        END IF;
        
        -- Update comment vote score
        IF NEW.comment_id IS NOT NULL THEN
            UPDATE discussion_comments 
            SET vote_score = (
                SELECT COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE -1 END), 0)
                FROM discussion_votes 
                WHERE comment_id = NEW.comment_id
            )
            WHERE id = NEW.comment_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update discussion vote score
        IF OLD.discussion_id IS NOT NULL THEN
            UPDATE discussions 
            SET vote_score = (
                SELECT COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE -1 END), 0)
                FROM discussion_votes 
                WHERE discussion_id = OLD.discussion_id
            )
            WHERE id = OLD.discussion_id;
        END IF;
        
        -- Update comment vote score
        IF OLD.comment_id IS NOT NULL THEN
            UPDATE discussion_comments 
            SET vote_score = (
                SELECT COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE -1 END), 0)
                FROM discussion_votes 
                WHERE comment_id = OLD.comment_id
            )
            WHERE id = OLD.comment_id;
        END IF;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.update_vote_scores() OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      PERFORM pg_notify(
          'realtime:system',
          jsonb_build_object(
              'error', SQLERRM,
              'function', 'realtime.send',
              'event', event,
              'topic', topic,
              'private', private
          )::text
      );
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


ALTER FUNCTION storage.add_prefixes(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


ALTER FUNCTION storage.delete_prefix(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


ALTER FUNCTION storage.delete_prefix_hierarchy_trigger() OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION storage.get_level(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


ALTER FUNCTION storage.get_prefix(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


ALTER FUNCTION storage.get_prefixes(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;

--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_insert_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.prefixes_insert_trigger() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
BEGIN
    RETURN query EXECUTE
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name || '/' AS name,
                    NULL::uuid AS id,
                    NULL::timestamptz AS updated_at,
                    NULL::timestamptz AS created_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
                ORDER BY prefixes.name COLLATE "C" LIMIT $3
            )
            UNION ALL
            (SELECT split_part(name, '/', $4) AS key,
                name,
                id,
                updated_at,
                created_at,
                metadata
            FROM storage.objects
            WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
            ORDER BY name COLLATE "C" LIMIT $3)
        ) obj
        ORDER BY name COLLATE "C" LIMIT $3;
        $sql$
        USING prefix, bucket_name, limits, levels, start_after;
END;
$_$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

--
-- Name: http_request(); Type: FUNCTION; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE FUNCTION supabase_functions.http_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'supabase_functions'
    AS $$
    DECLARE
      request_id bigint;
      payload jsonb;
      url text := TG_ARGV[0]::text;
      method text := TG_ARGV[1]::text;
      headers jsonb DEFAULT '{}'::jsonb;
      params jsonb DEFAULT '{}'::jsonb;
      timeout_ms integer DEFAULT 1000;
    BEGIN
      IF url IS NULL OR url = 'null' THEN
        RAISE EXCEPTION 'url argument is missing';
      END IF;

      IF method IS NULL OR method = 'null' THEN
        RAISE EXCEPTION 'method argument is missing';
      END IF;

      IF TG_ARGV[2] IS NULL OR TG_ARGV[2] = 'null' THEN
        headers = '{"Content-Type": "application/json"}'::jsonb;
      ELSE
        headers = TG_ARGV[2]::jsonb;
      END IF;

      IF TG_ARGV[3] IS NULL OR TG_ARGV[3] = 'null' THEN
        params = '{}'::jsonb;
      ELSE
        params = TG_ARGV[3]::jsonb;
      END IF;

      IF TG_ARGV[4] IS NULL OR TG_ARGV[4] = 'null' THEN
        timeout_ms = 1000;
      ELSE
        timeout_ms = TG_ARGV[4]::integer;
      END IF;

      CASE
        WHEN method = 'GET' THEN
          SELECT http_get INTO request_id FROM net.http_get(
            url,
            params,
            headers,
            timeout_ms
          );
        WHEN method = 'POST' THEN
          payload = jsonb_build_object(
            'old_record', OLD,
            'record', NEW,
            'type', TG_OP,
            'table', TG_TABLE_NAME,
            'schema', TG_TABLE_SCHEMA
          );

          SELECT http_post INTO request_id FROM net.http_post(
            url,
            payload,
            params,
            headers,
            timeout_ms
          );
        ELSE
          RAISE EXCEPTION 'method argument % is invalid', method;
      END CASE;

      INSERT INTO supabase_functions.hooks
        (hook_table_id, hook_name, request_id)
      VALUES
        (TG_RELID, TG_NAME, request_id);

      RETURN NEW;
    END
  $$;


ALTER FUNCTION supabase_functions.http_request() OWNER TO supabase_functions_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: extensions; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.extensions (
    id uuid NOT NULL,
    type text,
    settings jsonb,
    tenant_external_id text,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE _realtime.extensions OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE _realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: tenants; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.tenants (
    id uuid NOT NULL,
    name text,
    external_id text,
    jwt_secret text,
    max_concurrent_users integer DEFAULT 200 NOT NULL,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    max_events_per_second integer DEFAULT 100 NOT NULL,
    postgres_cdc_default text DEFAULT 'postgres_cdc_rls'::text,
    max_bytes_per_second integer DEFAULT 100000 NOT NULL,
    max_channels_per_client integer DEFAULT 100 NOT NULL,
    max_joins_per_second integer DEFAULT 500 NOT NULL,
    suspend boolean DEFAULT false,
    jwt_jwks jsonb,
    notify_private_alpha boolean DEFAULT false,
    private_only boolean DEFAULT false NOT NULL
);


ALTER TABLE _realtime.tenants OWNER TO supabase_admin;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addresses (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    addressline1 text,
    addressline2 text,
    country text,
    state text,
    city text,
    zip_code text,
    is_indian boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.addresses OWNER TO postgres;

--
-- Name: advertisements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.advertisements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    image_url text NOT NULL,
    link text,
    is_active boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    description text
);


ALTER TABLE public.advertisements OWNER TO postgres;

--
-- Name: contact_responses; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.contact_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50) NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "check" boolean DEFAULT false
);


ALTER TABLE public.contact_responses OWNER TO supabase_admin;

--
-- Name: COLUMN contact_responses."check"; Type: COMMENT; Schema: public; Owner: supabase_admin
--

COMMENT ON COLUMN public.contact_responses."check" IS 'Manually mark as true if contacted';


--
-- Name: landing_emails; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.landing_emails (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    subscribed_at timestamp with time zone DEFAULT now(),
    source character varying(100) DEFAULT 'footer_newsletter'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.landing_emails OWNER TO supabase_admin;

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    email text,
    phone_code text,
    phone_number text,
    dob date,
    gender text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_public boolean DEFAULT false,
    is_admin boolean DEFAULT false,
    avc_id character varying(10),
    has_business_card boolean DEFAULT false,
    last_login timestamp with time zone
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: all_emails; Type: VIEW; Schema: public; Owner: supabase_admin
--

CREATE VIEW public.all_emails AS
 SELECT profiles.id,
    COALESCE(profiles.full_name, 'AV User'::text) AS name,
    profiles.email,
    'profile'::text AS source,
    profiles.created_at,
    profiles.updated_at
   FROM public.profiles
  WHERE ((profiles.email IS NOT NULL) AND (profiles.email <> ''::text))
UNION ALL
 SELECT contact_responses.id,
    COALESCE(contact_responses.name, 'AV User'::character varying) AS name,
    contact_responses.email,
    'contact_form'::text AS source,
    contact_responses.created_at,
    contact_responses.updated_at
   FROM public.contact_responses
  WHERE ((contact_responses.email IS NOT NULL) AND ((contact_responses.email)::text <> ''::text))
UNION ALL
 SELECT landing_emails.id,
    'AV User'::text AS name,
    landing_emails.email,
    'newsletter'::text AS source,
    landing_emails.subscribed_at AS created_at,
    landing_emails.updated_at
   FROM public.landing_emails
  WHERE ((landing_emails.email IS NOT NULL) AND ((landing_emails.email)::text <> ''::text) AND (landing_emails.is_active = true));


ALTER TABLE public.all_emails OWNER TO supabase_admin;

--
-- Name: brands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brands (
    id text NOT NULL,
    name text NOT NULL,
    logo text,
    description text,
    rating double precision,
    review_count integer,
    featured boolean,
    trending boolean,
    recent_activity text,
    year_founded integer,
    headquarters text,
    website text,
    employees text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.brands OWNER TO postgres;

--
-- Name: cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    status text DEFAULT 'active'::text,
    CONSTRAINT cart_status_check CHECK ((status = ANY (ARRAY['active'::text, 'abandoned'::text, 'converted'::text])))
);


ALTER TABLE public.cart OWNER TO postgres;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cart_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT cart_items_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT cart_items_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    price numeric(10,2) NOT NULL,
    condition text NOT NULL,
    category text NOT NULL,
    location text,
    seller_id uuid NOT NULL,
    image_url text,
    is_featured boolean DEFAULT false,
    is_active boolean DEFAULT true,
    quantity integer DEFAULT 1,
    posted_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    brand_id text,
    category_id uuid,
    features text[],
    pros text[],
    cons text[],
    last_reviewed text,
    CONSTRAINT products_condition_check CHECK ((condition = ANY (ARRAY['New'::text, 'Like New'::text, 'Good'::text, 'Fair'::text, 'For Parts'::text])))
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: cart_with_items; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.cart_with_items AS
 SELECT c.id AS cart_id,
    c.user_id,
    c.status AS cart_status,
    c.created_at AS cart_created_at,
    c.updated_at AS cart_updated_at,
    ci.id AS item_id,
    ci.product_id,
    ci.quantity,
    ci.price AS item_price,
    ((ci.quantity)::numeric * ci.price) AS item_total,
    p.title AS product_name,
    p.description AS product_description,
    p.image_url AS product_image_url,
    p.seller_id,
    p.category_id,
    p.brand_id,
    p.condition,
    p.location,
    profiles.full_name AS seller_name
   FROM (((public.cart c
     LEFT JOIN public.cart_items ci ON ((c.id = ci.cart_id)))
     LEFT JOIN public.products p ON ((ci.product_id = p.id)))
     LEFT JOIN public.profiles ON ((p.seller_id = profiles.id)))
  WHERE (c.status = 'active'::text);


ALTER TABLE public.cart_with_items OWNER TO postgres;

--
-- Name: certifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certifications (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    name text,
    completion_id text,
    url text,
    validity text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.certifications OWNER TO postgres;

--
-- Name: discussion_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discussion_attachments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    discussion_id uuid,
    comment_id uuid,
    file_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_type character varying(100) NOT NULL,
    file_size integer NOT NULL,
    mime_type character varying(100),
    alt_text text,
    is_deleted boolean DEFAULT false,
    uploaded_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT attachment_belongs_to_discussion_or_comment CHECK ((((discussion_id IS NOT NULL) AND (comment_id IS NULL)) OR ((discussion_id IS NULL) AND (comment_id IS NOT NULL))))
);


ALTER TABLE public.discussion_attachments OWNER TO postgres;

--
-- Name: discussion_bookmarks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discussion_bookmarks (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    discussion_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.discussion_bookmarks OWNER TO postgres;

--
-- Name: discussion_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discussion_categories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    color character varying(7) DEFAULT '#3B82F6'::character varying,
    icon character varying(50),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.discussion_categories OWNER TO postgres;

--
-- Name: discussion_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discussion_comments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    discussion_id uuid NOT NULL,
    parent_id uuid,
    author_id uuid NOT NULL,
    content text NOT NULL,
    is_deleted boolean DEFAULT false,
    is_edited boolean DEFAULT false,
    vote_score integer DEFAULT 0,
    reply_count integer DEFAULT 0,
    depth integer DEFAULT 0,
    path text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.discussion_comments OWNER TO postgres;

--
-- Name: discussion_poll_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discussion_poll_options (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    poll_id uuid NOT NULL,
    option_text character varying(200) NOT NULL,
    vote_count integer DEFAULT 0,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.discussion_poll_options OWNER TO postgres;

--
-- Name: discussion_poll_votes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discussion_poll_votes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    poll_id uuid NOT NULL,
    option_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.discussion_poll_votes OWNER TO postgres;

--
-- Name: discussion_polls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discussion_polls (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    discussion_id uuid NOT NULL,
    question text NOT NULL,
    description text,
    is_multiple_choice boolean DEFAULT false,
    is_anonymous boolean DEFAULT false,
    expires_at timestamp with time zone,
    total_votes integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.discussion_polls OWNER TO postgres;

--
-- Name: discussion_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discussion_reports (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    reporter_id uuid NOT NULL,
    discussion_id uuid,
    comment_id uuid,
    reason character varying(50) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'pending'::character varying,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT discussion_reports_reason_check CHECK (((reason)::text = ANY (ARRAY[('spam'::character varying)::text, ('harassment'::character varying)::text, ('inappropriate'::character varying)::text, ('misinformation'::character varying)::text, ('other'::character varying)::text]))),
    CONSTRAINT discussion_reports_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('reviewed'::character varying)::text, ('resolved'::character varying)::text, ('dismissed'::character varying)::text]))),
    CONSTRAINT report_belongs_to_discussion_or_comment CHECK ((((discussion_id IS NOT NULL) AND (comment_id IS NULL)) OR ((discussion_id IS NULL) AND (comment_id IS NOT NULL))))
);


ALTER TABLE public.discussion_reports OWNER TO postgres;

--
-- Name: discussion_shares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discussion_shares (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    discussion_id uuid,
    comment_id uuid,
    share_type character varying(20) DEFAULT 'link'::character varying,
    platform character varying(50),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT discussion_shares_share_type_check CHECK (((share_type)::text = ANY (ARRAY[('link'::character varying)::text, ('embed'::character varying)::text, ('social'::character varying)::text]))),
    CONSTRAINT share_belongs_to_discussion_or_comment CHECK ((((discussion_id IS NOT NULL) AND (comment_id IS NULL)) OR ((discussion_id IS NULL) AND (comment_id IS NOT NULL))))
);


ALTER TABLE public.discussion_shares OWNER TO postgres;

--
-- Name: discussion_views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discussion_views (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    discussion_id uuid NOT NULL,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.discussion_views OWNER TO postgres;

--
-- Name: discussion_votes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discussion_votes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    discussion_id uuid,
    comment_id uuid,
    vote_type character varying(10) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT discussion_votes_vote_type_check CHECK (((vote_type)::text = ANY (ARRAY[('up'::character varying)::text, ('down'::character varying)::text]))),
    CONSTRAINT vote_belongs_to_discussion_or_comment CHECK ((((discussion_id IS NOT NULL) AND (comment_id IS NULL)) OR ((discussion_id IS NULL) AND (comment_id IS NOT NULL))))
);


ALTER TABLE public.discussion_votes OWNER TO postgres;

--
-- Name: discussions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discussions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title character varying(300) NOT NULL,
    content text,
    content_type character varying(20) DEFAULT 'text'::character varying,
    author_id uuid NOT NULL,
    category_id uuid,
    is_pinned boolean DEFAULT false,
    is_locked boolean DEFAULT false,
    is_archived boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    view_count integer DEFAULT 0,
    comment_count integer DEFAULT 0,
    vote_score integer DEFAULT 0,
    share_count integer DEFAULT 0,
    slug character varying(350),
    tags text[],
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_activity_at timestamp with time zone DEFAULT now(),
    CONSTRAINT discussions_content_type_check CHECK (((content_type)::text = ANY (ARRAY[('text'::character varying)::text, ('poll'::character varying)::text, ('link'::character varying)::text, ('image'::character varying)::text])))
);


ALTER TABLE public.discussions OWNER TO postgres;

--
-- Name: education; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.education (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    level text,
    university text,
    course text,
    specialization text,
    course_type text,
    start_date date,
    end_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.education OWNER TO postgres;

--
-- Name: employment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employment (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    company_name text,
    designation text,
    company_email text,
    location text,
    work_status text,
    total_experience_years integer,
    total_experience_months integer,
    current_salary text,
    skills text,
    notice_period text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    expected_salary text,
    salary_frequency text,
    is_current_employment boolean,
    employment_type text,
    joining_year text,
    joining_month text
);


ALTER TABLE public.employment OWNER TO postgres;

--
-- Name: event_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_logs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    event_id uuid NOT NULL,
    user_id uuid NOT NULL,
    registered_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.event_logs OWNER TO postgres;

--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    content text NOT NULL,
    image_url text,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    location text,
    category text NOT NULL,
    registration_url text,
    is_featured boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    status character varying(20) DEFAULT 'approved'::character varying NOT NULL,
    requested_by uuid,
    CONSTRAINT events_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('approved'::character varying)::text, ('rejected'::character varying)::text])))
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: job_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    applicant_id uuid NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    cover_letter text,
    resume_url text,
    applied_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    notes text,
    CONSTRAINT job_applications_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('reviewing'::character varying)::text, ('interviewed'::character varying)::text, ('rejected'::character varying)::text, ('accepted'::character varying)::text])))
);


ALTER TABLE public.job_applications OWNER TO postgres;

--
-- Name: job_approval_queue; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.job_approval_queue (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    job_id uuid NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    approved_by uuid,
    approved_at timestamp with time zone,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT job_approval_queue_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.job_approval_queue OWNER TO supabase_admin;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    company character varying(255) NOT NULL,
    location character varying(255),
    salary_range character varying(100),
    job_type character varying(50) DEFAULT 'full-time'::character varying,
    experience_level character varying(50) DEFAULT 'mid-level'::character varying,
    requirements text[],
    benefits text[],
    posted_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    application_deadline timestamp with time zone,
    is_active boolean DEFAULT true,
    category character varying(255),
    company_logo text,
    fts tsvector GENERATED ALWAYS AS (to_tsvector('english'::regconfig, (((((COALESCE(title, ''::character varying))::text || ' '::text) || COALESCE(description, ''::text)) || ' '::text) || (COALESCE(company, ''::character varying))::text))) STORED,
    CONSTRAINT experience_level_check CHECK (((experience_level)::text = ANY (ARRAY[('entry-level'::character varying)::text, ('mid-level'::character varying)::text, ('senior-level'::character varying)::text, ('executive'::character varying)::text]))),
    CONSTRAINT job_category_check CHECK (((category)::text = ANY (ARRAY[('all'::character varying)::text, ('av-engineer'::character varying)::text, ('av-designer'::character varying)::text, ('cad-engineer'::character varying)::text, ('pre-sales'::character varying)::text, ('av-support'::character varying)::text, ('av-events'::character varying)::text, ('av-project'::character varying)::text, ('top'::character varying)::text]))),
    CONSTRAINT job_type_check CHECK (((job_type)::text = ANY (ARRAY[('full-time'::character varying)::text, ('part-time'::character varying)::text, ('contract'::character varying)::text, ('remote'::character varying)::text, ('internship'::character varying)::text])))
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: notification_delivery_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_delivery_log (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    notification_id uuid NOT NULL,
    delivery_method character varying(20) NOT NULL,
    delivery_status character varying(20) NOT NULL,
    attempted_at timestamp with time zone DEFAULT now(),
    delivered_at timestamp with time zone,
    failed_at timestamp with time zone,
    error_message text,
    provider_response jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notification_delivery_log_delivery_method_check CHECK (((delivery_method)::text = ANY (ARRAY[('realtime'::character varying)::text, ('email'::character varying)::text, ('push'::character varying)::text, ('sms'::character varying)::text]))),
    CONSTRAINT notification_delivery_log_delivery_status_check CHECK (((delivery_status)::text = ANY (ARRAY[('pending'::character varying)::text, ('sent'::character varying)::text, ('delivered'::character varying)::text, ('failed'::character varying)::text, ('bounced'::character varying)::text])))
);


ALTER TABLE public.notification_delivery_log OWNER TO postgres;

--
-- Name: notification_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_settings (
    user_id uuid NOT NULL,
    email_notifications boolean DEFAULT true,
    push_notifications boolean DEFAULT true,
    sms_notifications boolean DEFAULT false,
    marketing_emails boolean DEFAULT true,
    updated_at timestamp with time zone DEFAULT now(),
    receive_newsletters boolean DEFAULT true,
    get_ekart_notifications boolean DEFAULT true,
    stay_updated_on_jobs boolean DEFAULT true,
    receive_daily_event_updates boolean DEFAULT false,
    get_trending_community_posts boolean DEFAULT true
);


ALTER TABLE public.notification_settings OWNER TO postgres;

--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_templates (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    notification_type character varying(50) NOT NULL,
    title_template character varying(200) NOT NULL,
    message_template text NOT NULL,
    default_priority character varying(20) DEFAULT 'normal'::character varying,
    is_active boolean DEFAULT true,
    variables jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.notification_templates OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    notification_type text NOT NULL,
    priority character varying(20) DEFAULT 'normal'::character varying,
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    data jsonb,
    reference_id uuid,
    reference_type character varying(50),
    triggered_by uuid,
    sent_via_email boolean DEFAULT false,
    sent_via_push boolean DEFAULT false,
    sent_via_sms boolean DEFAULT false,
    email_sent_at timestamp with time zone,
    push_sent_at timestamp with time zone,
    sms_sent_at timestamp with time zone,
    action_url text,
    action_text character varying(100),
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notifications_notification_type_check CHECK ((notification_type = ANY (ARRAY['new_comment'::text, 'comment_reply'::text, 'discussion_like'::text, 'comment_like'::text, 'mention'::text, 'discussion_update'::text, 'poll_vote'::text, 'order_placed'::text, 'order_shipped'::text, 'order_delivered'::text, 'order_cancelled'::text, 'payment_received'::text, 'payment_failed'::text, 'product_purchased'::text, 'product_status_update'::text, 'enrollment_confirmed'::text, 'course_started'::text, 'course_completed'::text, 'certificate_issued'::text, 'training_reminder'::text, 'job_posted'::text, 'application_received'::text, 'job_status_update'::text, 'job_approval_status'::text, 'job_approved'::text, 'job_rejected'::text, 'points_earned'::text, 'points_spent'::text, 'reward_purchased'::text, 'reward_status_update'::text, 'level_up'::text, 'welcome'::text, 'newsletter'::text, 'announcement'::text, 'system_update'::text, 'event_reminder'::text, 'event_cancelled'::text, 'event_updated'::text, 'custom'::text, 'other'::text]))),
    CONSTRAINT notifications_priority_check CHECK (((priority)::text = ANY (ARRAY[('low'::character varying)::text, ('normal'::character varying)::text, ('high'::character varying)::text, ('urgent'::character varying)::text])))
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: CONSTRAINT notifications_notification_type_check ON notifications; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT notifications_notification_type_check ON public.notifications IS 'Updated to include reward_status_update notification type';


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    product_name text NOT NULL,
    product_description text,
    product_image_url text,
    seller_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT order_items_total_price_check CHECK ((total_price >= (0)::numeric)),
    CONSTRAINT order_items_unit_price_check CHECK ((unit_price >= (0)::numeric))
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_number_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_number_seq OWNER TO postgres;

--
-- Name: order_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.order_summary AS
SELECT
    NULL::uuid AS order_id,
    NULL::uuid AS user_id,
    NULL::text AS order_number,
    NULL::text AS status,
    NULL::numeric(10,2) AS total_amount,
    NULL::numeric(10,2) AS subtotal,
    NULL::integer AS points_used,
    NULL::integer AS points_earned,
    NULL::text AS payment_status,
    NULL::timestamp with time zone AS created_at,
    NULL::timestamp with time zone AS updated_at,
    NULL::bigint AS total_items,
    NULL::bigint AS total_quantity,
    NULL::text AS customer_name,
    NULL::text AS customer_email;


ALTER TABLE public.order_summary OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    order_number text NOT NULL,
    status text DEFAULT 'pending'::text,
    total_amount numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0,
    shipping_amount numeric(10,2) DEFAULT 0,
    discount_amount numeric(10,2) DEFAULT 0,
    points_used integer DEFAULT 0,
    points_earned integer DEFAULT 0,
    payment_method text,
    payment_status text DEFAULT 'pending'::text,
    shipping_address jsonb,
    billing_address jsonb,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    shipped_at timestamp with time zone,
    delivered_at timestamp with time zone,
    contact_number text,
    transaction_id uuid NOT NULL,
    CONSTRAINT orders_discount_amount_check CHECK ((discount_amount >= (0)::numeric)),
    CONSTRAINT orders_payment_status_check CHECK ((payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text]))),
    CONSTRAINT orders_points_earned_check CHECK ((points_earned >= 0)),
    CONSTRAINT orders_points_used_check CHECK ((points_used >= 0)),
    CONSTRAINT orders_shipping_amount_check CHECK ((shipping_amount >= (0)::numeric)),
    CONSTRAINT orders_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text, 'refunded'::text]))),
    CONSTRAINT orders_subtotal_check CHECK ((subtotal >= (0)::numeric)),
    CONSTRAINT orders_tax_amount_check CHECK ((tax_amount >= (0)::numeric)),
    CONSTRAINT orders_total_amount_check CHECK ((total_amount >= (0)::numeric))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: COLUMN orders.contact_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.orders.contact_number IS 'Contact number for order delivery and communication';


--
-- Name: COLUMN orders.transaction_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.orders.transaction_id IS 'Reference to the transaction record for this order';


--
-- Name: points; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.points (
    user_id uuid NOT NULL,
    total_points integer DEFAULT 0,
    total_earned integer DEFAULT 0,
    total_spent integer DEFAULT 0,
    last_updated timestamp with time zone DEFAULT now(),
    category uuid
);


ALTER TABLE public.points OWNER TO postgres;

--
-- Name: points_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.points_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    display_name character varying(100) NOT NULL,
    description text,
    icon character varying(50),
    color character varying(20),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.points_categories OWNER TO postgres;

--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    icon text,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.product_categories OWNER TO postgres;

--
-- Name: profile_completion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile_completion (
    user_id uuid NOT NULL,
    basic_details boolean DEFAULT false,
    employment boolean DEFAULT false,
    certifications boolean DEFAULT false,
    address boolean DEFAULT false,
    social_links boolean DEFAULT false,
    completion_percentage integer DEFAULT 0,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.profile_completion OWNER TO postgres;

--
-- Name: social_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.social_links (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    platform text NOT NULL,
    url text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.social_links OWNER TO postgres;

--
-- Name: public_profiles; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.public_profiles AS
 SELECT p.id,
    COALESCE(p.full_name, ''::text) AS full_name,
    COALESCE(p.email, ''::text) AS email,
        CASE
            WHEN ((p.avatar_url IS NOT NULL) AND (p.avatar_url <> ''::text)) THEN p.avatar_url
            WHEN (((auth_user.raw_user_meta_data ->> 'avatar_url'::text) IS NOT NULL) AND ((auth_user.raw_user_meta_data ->> 'avatar_url'::text) <> ''::text)) THEN (auth_user.raw_user_meta_data ->> 'avatar_url'::text)
            ELSE ''::text
        END AS avatar_url,
    p.avc_id,
    p.is_public,
    COALESCE(a.city, ''::text) AS city,
    COALESCE(a.country, ''::text) AS country,
    COALESCE(e.designation, ''::text) AS designation,
    COALESCE(e.company_name, ''::text) AS company_name,
    COALESCE(pt.total_points, 0) AS total_points,
    ARRAY( SELECT c.name
           FROM public.certifications c
          WHERE ((c.user_id = p.id) AND (c.name IS NOT NULL) AND (c.name <> ''::text))) AS certifications,
    COALESCE(json_object_agg(sl.platform, sl.url) FILTER (WHERE ((sl.platform IS NOT NULL) AND (sl.url IS NOT NULL))), '{}'::json) AS social_links,
        CASE
            WHEN ((p.phone_code IS NOT NULL) AND (p.phone_number IS NOT NULL)) THEN (p.phone_code || p.phone_number)
            ELSE ''::text
        END AS phone
   FROM (((((public.profiles p
     LEFT JOIN auth.users auth_user ON ((auth_user.id = p.id)))
     LEFT JOIN ( SELECT DISTINCT ON (employment.user_id) employment.id,
            employment.user_id,
            employment.company_name,
            employment.designation,
            employment.company_email,
            employment.location,
            employment.work_status,
            employment.total_experience_years,
            employment.total_experience_months,
            employment.current_salary,
            employment.skills,
            employment.notice_period,
            employment.created_at,
            employment.updated_at,
            employment.expected_salary,
            employment.salary_frequency,
            employment.is_current_employment,
            employment.employment_type,
            employment.joining_year,
            employment.joining_month
           FROM public.employment
          WHERE ((employment.is_current_employment IS TRUE) OR (employment.is_current_employment IS NULL))
          ORDER BY employment.user_id, employment.updated_at DESC) e ON ((e.user_id = p.id)))
     LEFT JOIN ( SELECT DISTINCT ON (addresses.user_id) addresses.id,
            addresses.user_id,
            addresses.addressline1,
            addresses.addressline2,
            addresses.country,
            addresses.state,
            addresses.city,
            addresses.zip_code,
            addresses.is_indian,
            addresses.created_at,
            addresses.updated_at
           FROM public.addresses
          ORDER BY addresses.user_id, addresses.updated_at DESC) a ON ((a.user_id = p.id)))
     LEFT JOIN public.points pt ON ((pt.user_id = p.id)))
     LEFT JOIN public.social_links sl ON ((sl.user_id = p.id)))
  WHERE (p.is_public = true)
  GROUP BY p.id, p.full_name, p.email, auth_user.raw_user_meta_data, p.avc_id, p.is_public, a.city, a.country, e.designation, e.company_name, pt.total_points, p.phone_code, p.phone_number, p.avatar_url;


ALTER TABLE public.public_profiles OWNER TO postgres;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    amount integer NOT NULL,
    type text NOT NULL,
    reason text NOT NULL,
    status text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    transaction_type text DEFAULT 'points'::text NOT NULL,
    reference_id text,
    currency text,
    payment_method text,
    status_history jsonb,
    category_id uuid,
    CONSTRAINT transactions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text]))),
    CONSTRAINT transactions_transaction_type_check CHECK ((transaction_type = ANY (ARRAY['points'::text, 'real'::text]))),
    CONSTRAINT transactions_type_check CHECK ((type = ANY (ARRAY['earn'::text, 'spend'::text])))
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: real_transactions; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.real_transactions AS
 SELECT transactions.id,
    transactions.user_id,
    transactions.amount,
    transactions.type,
    transactions.reason,
    transactions.status,
    transactions.metadata,
    transactions.created_at,
    transactions.reference_id,
    transactions.currency,
    transactions.payment_method,
    transactions.status_history
   FROM public.transactions
  WHERE (transactions.transaction_type = 'real'::text);


ALTER TABLE public.real_transactions OWNER TO postgres;

--
-- Name: review_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.review_categories OWNER TO postgres;

--
-- Name: review_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    review_id uuid,
    user_id uuid,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.review_comments OWNER TO postgres;

--
-- Name: review_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_products (
    name text NOT NULL,
    brand_id text,
    image text,
    category_id uuid,
    price text,
    description text,
    features text[],
    pros text[],
    cons text[],
    last_reviewed text,
    created_at timestamp with time zone DEFAULT now(),
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.review_products OWNER TO postgres;

--
-- Name: review_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    product_id uuid,
    content text,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.review_requests OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    image_url text,
    product_id uuid,
    user_id uuid,
    category_id uuid,
    rating integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: reward_purchases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reward_purchases (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    reward_id uuid NOT NULL,
    transaction_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    points_spent integer NOT NULL,
    purchased_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'pending'::text NOT NULL,
    CONSTRAINT positive_points_spent CHECK ((points_spent > 0)),
    CONSTRAINT positive_quantity CHECK ((quantity > 0)),
    CONSTRAINT reward_purchases_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text])))
);


ALTER TABLE public.reward_purchases OWNER TO postgres;

--
-- Name: rewards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rewards (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    price integer NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    delivery_description text,
    category text NOT NULL,
    image_url text,
    is_featured boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT non_negative_quantity CHECK ((quantity >= 0)),
    CONSTRAINT positive_price CHECK ((price > 0)),
    CONSTRAINT rewards_category_check CHECK ((category = ANY (ARRAY['merchandise'::text, 'digital'::text, 'experiences'::text])))
);


ALTER TABLE public.rewards OWNER TO postgres;

--
-- Name: reward_purchase_details; Type: VIEW; Schema: public; Owner: supabase_admin
--

CREATE VIEW public.reward_purchase_details AS
 SELECT rp.id,
    rp.user_id,
    p.full_name AS user_name,
    p.email AS user_email,
    p.avatar_url AS user_avatar_url,
    rp.reward_id,
    r.title AS reward_title,
    r.description AS reward_description,
    r.category AS reward_category,
    rp.quantity,
    rp.points_spent,
    rp.purchased_at,
    rp.transaction_id,
    rp.status AS purchase_status,
    t.status AS transaction_status
   FROM (((public.reward_purchases rp
     JOIN public.profiles p ON ((rp.user_id = p.id)))
     JOIN public.rewards r ON ((rp.reward_id = r.id)))
     JOIN public.transactions t ON ((rp.transaction_id = t.id)));


ALTER TABLE public.reward_purchase_details OWNER TO supabase_admin;

--
-- Name: seller_order_items; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.seller_order_items AS
 SELECT oi.id AS order_item_id,
    oi.order_id,
    o.order_number,
    o.status AS order_status,
    o.created_at AS order_date,
    oi.product_id,
    oi.product_name,
    oi.quantity,
    oi.unit_price,
    oi.total_price,
    oi.seller_id,
    seller_profiles.full_name AS seller_name,
    buyer_profiles.full_name AS buyer_name,
    buyer_profiles.email AS buyer_email,
    o.shipping_address
   FROM (((public.order_items oi
     JOIN public.orders o ON ((oi.order_id = o.id)))
     LEFT JOIN public.profiles seller_profiles ON ((oi.seller_id = seller_profiles.id)))
     LEFT JOIN public.profiles buyer_profiles ON ((o.user_id = buyer_profiles.id)));


ALTER TABLE public.seller_order_items OWNER TO postgres;

--
-- Name: seller_profiles; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.seller_profiles AS
 SELECT u.id AS user_id,
    p.full_name AS name,
    p.avatar_url,
    COALESCE(pt.total_points, 0) AS points,
    ( SELECT (avg(ratings.rating))::numeric(3,1) AS avg
           FROM ( VALUES (4.5), (4.7), (4.8), (4.6), (4.9)) ratings(rating)
          WHERE (u.id = u.id)) AS rating,
    count(pr.id) AS products_count
   FROM (((auth.users u
     LEFT JOIN public.profiles p ON ((u.id = p.id)))
     LEFT JOIN public.points pt ON ((u.id = pt.user_id)))
     LEFT JOIN public.products pr ON ((u.id = pr.seller_id)))
  GROUP BY u.id, p.full_name, p.avatar_url, pt.total_points;


ALTER TABLE public.seller_profiles OWNER TO postgres;

--
-- Name: tool_purchases; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.tool_purchases AS
 SELECT t.id,
    t.user_id,
    (t.metadata ->> 'toolId'::text) AS tool_id,
    t.amount AS points_spent,
    t.created_at AS purchased_at,
    t.status
   FROM public.transactions t
  WHERE ((t.transaction_type = 'points'::text) AND (t.type = 'spend'::text) AND ((t.metadata ->> 'toolId'::text) IS NOT NULL));


ALTER TABLE public.tool_purchases OWNER TO postgres;

--
-- Name: training_enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.training_enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    program_id uuid,
    full_name text NOT NULL,
    email text NOT NULL,
    mobile_number text NOT NULL,
    location text NOT NULL,
    working_status text NOT NULL,
    preferred_mode text NOT NULL,
    enrollment_status text DEFAULT 'pending'::text,
    enrolled_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT training_enrollments_enrollment_status_check CHECK ((enrollment_status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text, 'completed'::text]))),
    CONSTRAINT training_enrollments_preferred_mode_check CHECK ((preferred_mode = ANY (ARRAY['online'::text, 'classroom'::text]))),
    CONSTRAINT training_enrollments_working_status_check CHECK ((working_status = ANY (ARRAY['yes'::text, 'no'::text])))
);


ALTER TABLE public.training_enrollments OWNER TO postgres;

--
-- Name: training_programs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.training_programs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    topics text NOT NULL,
    duration text NOT NULL,
    mode text NOT NULL,
    fees text NOT NULL,
    image_url text,
    is_featured boolean DEFAULT false,
    is_active boolean DEFAULT true,
    weekly_curriculum jsonb,
    hardware_requirements jsonb,
    software_requirements jsonb,
    advantages jsonb,
    learning_outcomes jsonb,
    instructors jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.training_programs OWNER TO postgres;

--
-- Name: user_notification_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_notification_preferences (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    email_enabled jsonb DEFAULT '{}'::jsonb,
    push_enabled jsonb DEFAULT '{}'::jsonb,
    sms_enabled jsonb DEFAULT '{}'::jsonb,
    email_frequency character varying(20) DEFAULT 'immediate'::character varying,
    push_frequency character varying(20) DEFAULT 'immediate'::character varying,
    quiet_hours_start time without time zone,
    quiet_hours_end time without time zone,
    quiet_hours_timezone character varying(50) DEFAULT 'UTC'::character varying,
    dnd_enabled boolean DEFAULT false,
    dnd_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_notification_preferences_email_frequency_check CHECK (((email_frequency)::text = ANY (ARRAY[('immediate'::character varying)::text, ('hourly'::character varying)::text, ('daily'::character varying)::text, ('weekly'::character varying)::text, ('never'::character varying)::text]))),
    CONSTRAINT user_notification_preferences_push_frequency_check CHECK (((push_frequency)::text = ANY (ARRAY[('immediate'::character varying)::text, ('hourly'::character varying)::text, ('daily'::character varying)::text, ('weekly'::character varying)::text, ('never'::character varying)::text])))
);


ALTER TABLE public.user_notification_preferences OWNER TO postgres;

--
-- Name: user_points_by_category; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.user_points_by_category AS
 SELECT t.user_id,
    pc.id AS category_id,
    pc.name AS category_name,
    pc.display_name AS category_display_name,
    pc.icon AS category_icon,
    pc.color AS category_color,
    COALESCE(sum(
        CASE
            WHEN (t.type = 'earn'::text) THEN t.amount
            ELSE 0
        END), (0)::bigint) AS total_earned,
    COALESCE(sum(
        CASE
            WHEN (t.type = 'spend'::text) THEN t.amount
            ELSE 0
        END), (0)::bigint) AS total_spent,
    COALESCE(sum(
        CASE
            WHEN (t.type = 'earn'::text) THEN t.amount
            ELSE (- t.amount)
        END), (0)::bigint) AS net_points,
    count(t.id) AS transaction_count,
    max(t.created_at) AS last_transaction_date
   FROM (public.points_categories pc
     LEFT JOIN public.transactions t ON (((pc.id = t.category_id) AND (t.transaction_type = 'points'::text) AND (t.status = 'completed'::text))))
  WHERE (pc.is_active = true)
  GROUP BY t.user_id, pc.id, pc.name, pc.display_name, pc.icon, pc.color
  ORDER BY COALESCE(sum(
        CASE
            WHEN (t.type = 'earn'::text) THEN t.amount
            ELSE (- t.amount)
        END), (0)::bigint) DESC;


ALTER TABLE public.user_points_by_category OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: messages_2025_06_13; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_06_13 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_06_13 OWNER TO supabase_admin;

--
-- Name: messages_2025_06_14; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_06_14 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_06_14 OWNER TO supabase_admin;

--
-- Name: messages_2025_06_15; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_06_15 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_06_15 OWNER TO supabase_admin;

--
-- Name: messages_2025_06_16; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_06_16 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_06_16 OWNER TO supabase_admin;

--
-- Name: messages_2025_06_17; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_06_17 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_06_17 OWNER TO supabase_admin;

--
-- Name: messages_2025_06_18; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_06_18 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_06_18 OWNER TO supabase_admin;

--
-- Name: messages_2025_06_19; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_06_19 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_06_19 OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE storage.prefixes OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: hooks; Type: TABLE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE TABLE supabase_functions.hooks (
    id bigint NOT NULL,
    hook_table_id integer NOT NULL,
    hook_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    request_id bigint
);


ALTER TABLE supabase_functions.hooks OWNER TO supabase_functions_admin;

--
-- Name: TABLE hooks; Type: COMMENT; Schema: supabase_functions; Owner: supabase_functions_admin
--

COMMENT ON TABLE supabase_functions.hooks IS 'Supabase Functions Hooks: Audit trail for triggered hooks.';


--
-- Name: hooks_id_seq; Type: SEQUENCE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE SEQUENCE supabase_functions.hooks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE supabase_functions.hooks_id_seq OWNER TO supabase_functions_admin;

--
-- Name: hooks_id_seq; Type: SEQUENCE OWNED BY; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER SEQUENCE supabase_functions.hooks_id_seq OWNED BY supabase_functions.hooks.id;


--
-- Name: migrations; Type: TABLE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE TABLE supabase_functions.migrations (
    version text NOT NULL,
    inserted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE supabase_functions.migrations OWNER TO supabase_functions_admin;

--
-- Name: messages_2025_06_13; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_06_13 FOR VALUES FROM ('2025-06-13 00:00:00') TO ('2025-06-14 00:00:00');


--
-- Name: messages_2025_06_14; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_06_14 FOR VALUES FROM ('2025-06-14 00:00:00') TO ('2025-06-15 00:00:00');


--
-- Name: messages_2025_06_15; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_06_15 FOR VALUES FROM ('2025-06-15 00:00:00') TO ('2025-06-16 00:00:00');


--
-- Name: messages_2025_06_16; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_06_16 FOR VALUES FROM ('2025-06-16 00:00:00') TO ('2025-06-17 00:00:00');


--
-- Name: messages_2025_06_17; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_06_17 FOR VALUES FROM ('2025-06-17 00:00:00') TO ('2025-06-18 00:00:00');


--
-- Name: messages_2025_06_18; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_06_18 FOR VALUES FROM ('2025-06-18 00:00:00') TO ('2025-06-19 00:00:00');


--
-- Name: messages_2025_06_19; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_06_19 FOR VALUES FROM ('2025-06-19 00:00:00') TO ('2025-06-20 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: hooks id; Type: DEFAULT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.hooks ALTER COLUMN id SET DEFAULT nextval('supabase_functions.hooks_id_seq'::regclass);


--
-- Data for Name: extensions; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.extensions (id, type, settings, tenant_external_id, inserted_at, updated_at) FROM stdin;
93def17a-3ff1-47ed-abcb-78324761f22f	postgres_cdc_rls	{"region": "us-east-1", "db_host": "QhixI0o7PYIABziLUL4f0A==", "db_name": "sWBpZNdjggEPTQVlI52Zfw==", "db_port": "+enMDFi1J/3IrrquHHwUmA==", "db_user": "uxbEq/zz8DXVD53TOI1zmw==", "slot_name": "supabase_realtime_replication_slot", "db_password": "sWBpZNdjggEPTQVlI52Zfw==", "publication": "supabase_realtime", "ssl_enforced": false, "poll_interval_ms": 100, "poll_max_changes": 100, "poll_max_record_bytes": 1048576}	realtime-dev	2025-07-04 17:19:35	2025-07-04 17:19:35
\.



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

COPY supabase_functions.hooks (id, hook_table_id, hook_name, created_at, request_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

COPY supabase_functions.migrations (version, inserted_at) FROM stdin;
initial	2025-06-08 20:31:17.327716+00
20210809183423_update_grants	2025-06-08 20:31:17.327716+00
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 117850, true);


--
-- Name: jobid_seq; Type: SEQUENCE SET; Schema: cron; Owner: supabase_admin
--

SELECT pg_catalog.setval('cron.jobid_seq', 1, true);


--
-- Name: runid_seq; Type: SEQUENCE SET; Schema: cron; Owner: supabase_admin
--

SELECT pg_catalog.setval('cron.runid_seq', 19, true);


--
-- Name: order_number_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_number_seq', 43, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 22404, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('supabase_functions.hooks_id_seq', 1, false);


--
-- Name: extensions extensions_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: advertisements advertisements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisements
    ADD CONSTRAINT advertisements_pkey PRIMARY KEY (id);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_cart_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_product_id_key UNIQUE (cart_id, product_id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (id);


--
-- Name: cart cart_user_id_status_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_user_id_status_key UNIQUE (user_id, status);


--
-- Name: certifications certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT certifications_pkey PRIMARY KEY (id);


--
-- Name: contact_responses contact_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.contact_responses
    ADD CONSTRAINT contact_responses_pkey PRIMARY KEY (id);


--
-- Name: discussion_attachments discussion_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_attachments
    ADD CONSTRAINT discussion_attachments_pkey PRIMARY KEY (id);


--
-- Name: discussion_bookmarks discussion_bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_bookmarks
    ADD CONSTRAINT discussion_bookmarks_pkey PRIMARY KEY (id);


--
-- Name: discussion_bookmarks discussion_bookmarks_user_id_discussion_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_bookmarks
    ADD CONSTRAINT discussion_bookmarks_user_id_discussion_id_key UNIQUE (user_id, discussion_id);


--
-- Name: discussion_categories discussion_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_categories
    ADD CONSTRAINT discussion_categories_name_key UNIQUE (name);


--
-- Name: discussion_categories discussion_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_categories
    ADD CONSTRAINT discussion_categories_pkey PRIMARY KEY (id);


--
-- Name: discussion_comments discussion_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_comments
    ADD CONSTRAINT discussion_comments_pkey PRIMARY KEY (id);


--
-- Name: discussion_poll_options discussion_poll_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_poll_options
    ADD CONSTRAINT discussion_poll_options_pkey PRIMARY KEY (id);


--
-- Name: discussion_poll_votes discussion_poll_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_poll_votes
    ADD CONSTRAINT discussion_poll_votes_pkey PRIMARY KEY (id);


--
-- Name: discussion_poll_votes discussion_poll_votes_poll_id_option_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_poll_votes
    ADD CONSTRAINT discussion_poll_votes_poll_id_option_id_user_id_key UNIQUE (poll_id, option_id, user_id);


--
-- Name: discussion_polls discussion_polls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_polls
    ADD CONSTRAINT discussion_polls_pkey PRIMARY KEY (id);


--
-- Name: discussion_reports discussion_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_reports
    ADD CONSTRAINT discussion_reports_pkey PRIMARY KEY (id);


--
-- Name: discussion_shares discussion_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_shares
    ADD CONSTRAINT discussion_shares_pkey PRIMARY KEY (id);


--
-- Name: discussion_views discussion_views_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_views
    ADD CONSTRAINT discussion_views_pkey PRIMARY KEY (id);


--
-- Name: discussion_votes discussion_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_votes
    ADD CONSTRAINT discussion_votes_pkey PRIMARY KEY (id);


--
-- Name: discussion_votes discussion_votes_user_id_discussion_id_comment_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_votes
    ADD CONSTRAINT discussion_votes_user_id_discussion_id_comment_id_key UNIQUE (user_id, discussion_id, comment_id);


--
-- Name: discussions discussions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT discussions_pkey PRIMARY KEY (id);


--
-- Name: discussions discussions_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT discussions_slug_key UNIQUE (slug);


--
-- Name: education education_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.education
    ADD CONSTRAINT education_pkey PRIMARY KEY (id);


--
-- Name: employment employment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employment
    ADD CONSTRAINT employment_pkey PRIMARY KEY (id);


--
-- Name: event_logs event_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_logs
    ADD CONSTRAINT event_logs_pkey PRIMARY KEY (id);


--
-- Name: event_logs event_logs_user_event_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_logs
    ADD CONSTRAINT event_logs_user_event_unique UNIQUE (user_id, event_id);


--
-- Name: CONSTRAINT event_logs_user_event_unique ON event_logs; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT event_logs_user_event_unique ON public.event_logs IS 'Prevents duplicate event registrations by the same user';


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: job_applications job_applications_job_id_applicant_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_job_id_applicant_id_key UNIQUE (job_id, applicant_id);


--
-- Name: job_applications job_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_pkey PRIMARY KEY (id);


--
-- Name: job_approval_queue job_approval_queue_job_id_unique; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.job_approval_queue
    ADD CONSTRAINT job_approval_queue_job_id_unique UNIQUE (job_id);


--
-- Name: CONSTRAINT job_approval_queue_job_id_unique ON job_approval_queue; Type: COMMENT; Schema: public; Owner: supabase_admin
--

COMMENT ON CONSTRAINT job_approval_queue_job_id_unique ON public.job_approval_queue IS 'Ensures each job can only have one listing in the approval queue';


--
-- Name: job_approval_queue job_approval_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.job_approval_queue
    ADD CONSTRAINT job_approval_queue_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: landing_emails landing_emails_email_key; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.landing_emails
    ADD CONSTRAINT landing_emails_email_key UNIQUE (email);


--
-- Name: landing_emails landing_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.landing_emails
    ADD CONSTRAINT landing_emails_pkey PRIMARY KEY (id);


--
-- Name: notification_delivery_log notification_delivery_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_delivery_log
    ADD CONSTRAINT notification_delivery_log_pkey PRIMARY KEY (id);


--
-- Name: notification_settings notification_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_pkey PRIMARY KEY (user_id);


--
-- Name: notification_templates notification_templates_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_name_key UNIQUE (name);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: points_categories points_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_categories
    ADD CONSTRAINT points_categories_name_key UNIQUE (name);


--
-- Name: points_categories points_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_categories
    ADD CONSTRAINT points_categories_pkey PRIMARY KEY (id);


--
-- Name: points points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points
    ADD CONSTRAINT points_pkey PRIMARY KEY (user_id);


--
-- Name: product_categories product_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_name_key UNIQUE (name);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: profile_completion profile_completion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_completion
    ADD CONSTRAINT profile_completion_pkey PRIMARY KEY (user_id);


--
-- Name: profiles profiles_avc_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_avc_id_key UNIQUE (avc_id);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: review_categories review_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_categories
    ADD CONSTRAINT review_categories_name_key UNIQUE (name);


--
-- Name: review_categories review_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_categories
    ADD CONSTRAINT review_categories_pkey PRIMARY KEY (id);


--
-- Name: review_comments review_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_comments
    ADD CONSTRAINT review_comments_pkey PRIMARY KEY (id);


--
-- Name: review_products review_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_products
    ADD CONSTRAINT review_products_pkey PRIMARY KEY (id);


--
-- Name: review_requests review_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_requests
    ADD CONSTRAINT review_requests_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: reward_purchases reward_purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reward_purchases
    ADD CONSTRAINT reward_purchases_pkey PRIMARY KEY (id);


--
-- Name: rewards rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT rewards_pkey PRIMARY KEY (id);


--
-- Name: social_links social_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_links
    ADD CONSTRAINT social_links_pkey PRIMARY KEY (id);


--
-- Name: training_enrollments training_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.training_enrollments
    ADD CONSTRAINT training_enrollments_pkey PRIMARY KEY (id);


--
-- Name: training_programs training_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.training_programs
    ADD CONSTRAINT training_programs_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: user_notification_preferences user_notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notification_preferences
    ADD CONSTRAINT user_notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_notification_preferences user_notification_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notification_preferences
    ADD CONSTRAINT user_notification_preferences_user_id_key UNIQUE (user_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_06_13 messages_2025_06_13_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_06_13
    ADD CONSTRAINT messages_2025_06_13_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_06_14 messages_2025_06_14_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_06_14
    ADD CONSTRAINT messages_2025_06_14_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_06_15 messages_2025_06_15_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_06_15
    ADD CONSTRAINT messages_2025_06_15_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_06_16 messages_2025_06_16_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_06_16
    ADD CONSTRAINT messages_2025_06_16_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_06_17 messages_2025_06_17_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_06_17
    ADD CONSTRAINT messages_2025_06_17_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_06_18 messages_2025_06_18_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_06_18
    ADD CONSTRAINT messages_2025_06_18_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_06_19 messages_2025_06_19_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_06_19
    ADD CONSTRAINT messages_2025_06_19_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: hooks hooks_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.hooks
    ADD CONSTRAINT hooks_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (version);


--
-- Name: extensions_tenant_external_id_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE INDEX extensions_tenant_external_id_index ON _realtime.extensions USING btree (tenant_external_id);


--
-- Name: extensions_tenant_external_id_type_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX extensions_tenant_external_id_type_index ON _realtime.extensions USING btree (tenant_external_id, type);


--
-- Name: tenants_external_id_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX tenants_external_id_index ON _realtime.tenants USING btree (external_id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_advertisements_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_advertisements_active ON public.advertisements USING btree (is_active);


--
-- Name: idx_advertisements_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_advertisements_order ON public.advertisements USING btree (display_order);


--
-- Name: idx_attachments_comment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attachments_comment ON public.discussion_attachments USING btree (comment_id);


--
-- Name: idx_attachments_discussion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attachments_discussion ON public.discussion_attachments USING btree (discussion_id);


--
-- Name: idx_cart_items_cart_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_cart_id ON public.cart_items USING btree (cart_id);


--
-- Name: idx_cart_items_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_items_product_id ON public.cart_items USING btree (product_id);


--
-- Name: idx_cart_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_status ON public.cart USING btree (status);


--
-- Name: idx_cart_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_user_id ON public.cart USING btree (user_id);


--
-- Name: idx_comments_author; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_author ON public.discussion_comments USING btree (author_id);


--
-- Name: idx_comments_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_created_at ON public.discussion_comments USING btree (created_at);


--
-- Name: idx_comments_discussion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_discussion ON public.discussion_comments USING btree (discussion_id);


--
-- Name: idx_comments_parent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_parent ON public.discussion_comments USING btree (parent_id);


--
-- Name: idx_comments_path; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_path ON public.discussion_comments USING btree (path);


--
-- Name: idx_contact_responses_created_at; Type: INDEX; Schema: public; Owner: supabase_admin
--

CREATE INDEX idx_contact_responses_created_at ON public.contact_responses USING btree (created_at);


--
-- Name: idx_contact_responses_email; Type: INDEX; Schema: public; Owner: supabase_admin
--

CREATE INDEX idx_contact_responses_email ON public.contact_responses USING btree (email);


--
-- Name: idx_delivery_log_method; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_log_method ON public.notification_delivery_log USING btree (delivery_method);


--
-- Name: idx_delivery_log_notification; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_log_notification ON public.notification_delivery_log USING btree (notification_id);


--
-- Name: idx_delivery_log_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_log_status ON public.notification_delivery_log USING btree (delivery_status);


--
-- Name: idx_discussions_author; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_discussions_author ON public.discussions USING btree (author_id);


--
-- Name: idx_discussions_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_discussions_category ON public.discussions USING btree (category_id);


--
-- Name: idx_discussions_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_discussions_created_at ON public.discussions USING btree (created_at DESC);


--
-- Name: idx_discussions_last_activity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_discussions_last_activity ON public.discussions USING btree (last_activity_at DESC);


--
-- Name: idx_discussions_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_discussions_slug ON public.discussions USING btree (slug);


--
-- Name: idx_discussions_tags; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_discussions_tags ON public.discussions USING gin (tags);


--
-- Name: idx_discussions_vote_score; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_discussions_vote_score ON public.discussions USING btree (vote_score DESC);


--
-- Name: idx_event_logs_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_logs_event_id ON public.event_logs USING btree (event_id);


--
-- Name: idx_event_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_logs_user_id ON public.event_logs USING btree (user_id);


--
-- Name: idx_events_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_category ON public.events USING btree (category);


--
-- Name: idx_events_is_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_is_featured ON public.events USING btree (is_featured);


--
-- Name: idx_events_start_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_start_date ON public.events USING btree (start_date);


--
-- Name: idx_job_applications_applicant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_applications_applicant_id ON public.job_applications USING btree (applicant_id);


--
-- Name: idx_job_applications_applied_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_applications_applied_at ON public.job_applications USING btree (applied_at);


--
-- Name: idx_job_applications_job_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_applications_job_id ON public.job_applications USING btree (job_id);


--
-- Name: idx_job_applications_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_job_applications_status ON public.job_applications USING btree (status);


--
-- Name: idx_job_approval_queue_job_id; Type: INDEX; Schema: public; Owner: supabase_admin
--

CREATE INDEX idx_job_approval_queue_job_id ON public.job_approval_queue USING btree (job_id);


--
-- Name: idx_job_approval_queue_status; Type: INDEX; Schema: public; Owner: supabase_admin
--

CREATE INDEX idx_job_approval_queue_status ON public.job_approval_queue USING btree (status);


--
-- Name: idx_jobs_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_company ON public.jobs USING btree (company);


--
-- Name: idx_jobs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_created_at ON public.jobs USING btree (created_at);


--
-- Name: idx_jobs_experience_level; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_experience_level ON public.jobs USING btree (experience_level);


--
-- Name: idx_jobs_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_is_active ON public.jobs USING btree (is_active);


--
-- Name: idx_jobs_job_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_job_type ON public.jobs USING btree (job_type);


--
-- Name: idx_jobs_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_location ON public.jobs USING btree (location);


--
-- Name: idx_jobs_posted_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_posted_by ON public.jobs USING btree (posted_by);


--
-- Name: idx_landing_emails_email; Type: INDEX; Schema: public; Owner: supabase_admin
--

CREATE INDEX idx_landing_emails_email ON public.landing_emails USING btree (email);


--
-- Name: idx_landing_emails_source; Type: INDEX; Schema: public; Owner: supabase_admin
--

CREATE INDEX idx_landing_emails_source ON public.landing_emails USING btree (source);


--
-- Name: idx_landing_emails_subscribed_at; Type: INDEX; Schema: public; Owner: supabase_admin
--

CREATE INDEX idx_landing_emails_subscribed_at ON public.landing_emails USING btree (subscribed_at);


--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC);


--
-- Name: idx_notifications_expiry; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_expiry ON public.notifications USING btree (expires_at) WHERE (expires_at IS NOT NULL);


--
-- Name: idx_notifications_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_priority ON public.notifications USING btree (priority);


--
-- Name: idx_notifications_reference; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_reference ON public.notifications USING btree (reference_type, reference_id);


--
-- Name: idx_notifications_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_type ON public.notifications USING btree (notification_type);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_notifications_user_unread; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, is_read) WHERE (is_read = false);


--
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: idx_order_items_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_product_id ON public.order_items USING btree (product_id);


--
-- Name: idx_order_items_seller_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_seller_id ON public.order_items USING btree (seller_id);


--
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at);


--
-- Name: idx_orders_order_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_order_number ON public.orders USING btree (order_number);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- Name: idx_points_categories_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_points_categories_active ON public.points_categories USING btree (is_active);


--
-- Name: idx_points_categories_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_points_categories_name ON public.points_categories USING btree (name);


--
-- Name: idx_products_brand_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_brand_id ON public.products USING btree (brand_id);


--
-- Name: idx_products_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_category_id ON public.products USING btree (category_id);


--
-- Name: idx_profiles_is_public; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profiles_is_public ON public.profiles USING btree (is_public);


--
-- Name: idx_review_comments_review_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_review_comments_review_id ON public.review_comments USING btree (review_id);


--
-- Name: idx_review_products_brand_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_review_products_brand_id ON public.review_products USING btree (brand_id);


--
-- Name: idx_review_products_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_review_products_category_id ON public.review_products USING btree (category_id);


--
-- Name: idx_review_requests_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_review_requests_product_id ON public.review_requests USING btree (product_id);


--
-- Name: idx_reviews_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_category_id ON public.reviews USING btree (category_id);


--
-- Name: idx_reviews_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_product_id ON public.reviews USING btree (product_id);


--
-- Name: idx_reward_purchases_purchased_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reward_purchases_purchased_at ON public.reward_purchases USING btree (purchased_at);


--
-- Name: idx_reward_purchases_reward_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reward_purchases_reward_id ON public.reward_purchases USING btree (reward_id);


--
-- Name: idx_reward_purchases_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reward_purchases_status ON public.reward_purchases USING btree (status);


--
-- Name: idx_reward_purchases_transaction_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reward_purchases_transaction_id ON public.reward_purchases USING btree (transaction_id);


--
-- Name: idx_reward_purchases_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reward_purchases_user_id ON public.reward_purchases USING btree (user_id);


--
-- Name: idx_rewards_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rewards_category ON public.rewards USING btree (category);


--
-- Name: idx_rewards_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rewards_created_at ON public.rewards USING btree (created_at);


--
-- Name: idx_rewards_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rewards_is_active ON public.rewards USING btree (is_active);


--
-- Name: idx_rewards_is_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rewards_is_featured ON public.rewards USING btree (is_featured);


--
-- Name: idx_training_enrollments_program_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_training_enrollments_program_id ON public.training_enrollments USING btree (program_id);


--
-- Name: idx_training_enrollments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_training_enrollments_status ON public.training_enrollments USING btree (enrollment_status);


--
-- Name: idx_training_programs_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_training_programs_active ON public.training_programs USING btree (is_active);


--
-- Name: idx_transactions_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_category_id ON public.transactions USING btree (category_id);


--
-- Name: idx_transactions_reference_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_reference_id ON public.transactions USING btree (reference_id);


--
-- Name: idx_transactions_tool_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_tool_id ON public.transactions USING gin (((metadata -> 'toolId'::text)));


--
-- Name: idx_transactions_transaction_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_transaction_type ON public.transactions USING btree (transaction_type);


--
-- Name: idx_transactions_user_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_user_category ON public.transactions USING btree (user_id, category_id);


--
-- Name: idx_views_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_views_created_at ON public.discussion_views USING btree (created_at);


--
-- Name: idx_views_discussion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_views_discussion ON public.discussion_views USING btree (discussion_id);


--
-- Name: idx_votes_user_comment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_votes_user_comment ON public.discussion_votes USING btree (user_id, comment_id);


--
-- Name: idx_votes_user_discussion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_votes_user_discussion ON public.discussion_votes USING btree (user_id, discussion_id);


--
-- Name: jobs_fts_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_fts_idx ON public.jobs USING gin (fts);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: supabase_functions_hooks_h_table_id_h_name_idx; Type: INDEX; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE INDEX supabase_functions_hooks_h_table_id_h_name_idx ON supabase_functions.hooks USING btree (hook_table_id, hook_name);


--
-- Name: supabase_functions_hooks_request_id_idx; Type: INDEX; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE INDEX supabase_functions_hooks_request_id_idx ON supabase_functions.hooks USING btree (request_id);


--
-- Name: messages_2025_06_13_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_06_13_pkey;


--
-- Name: messages_2025_06_14_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_06_14_pkey;


--
-- Name: messages_2025_06_15_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_06_15_pkey;


--
-- Name: messages_2025_06_16_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_06_16_pkey;


--
-- Name: messages_2025_06_17_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_06_17_pkey;


--
-- Name: messages_2025_06_18_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_06_18_pkey;


--
-- Name: messages_2025_06_19_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_06_19_pkey;


--
-- Name: order_summary _RETURN; Type: RULE; Schema: public; Owner: postgres
--

CREATE OR REPLACE VIEW public.order_summary AS
 SELECT o.id AS order_id,
    o.user_id,
    o.order_number,
    o.status,
    o.total_amount,
    o.subtotal,
    o.points_used,
    o.points_earned,
    o.payment_status,
    o.created_at,
    o.updated_at,
    count(oi.id) AS total_items,
    sum(oi.quantity) AS total_quantity,
    profiles.full_name AS customer_name,
    profiles.email AS customer_email
   FROM ((public.orders o
     LEFT JOIN public.order_items oi ON ((o.id = oi.order_id)))
     LEFT JOIN public.profiles ON ((o.user_id = profiles.id)))
  GROUP BY o.id, profiles.full_name, profiles.email;


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: supabase_auth_admin
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: advertisements set_updated_at_on_advertisements; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at_on_advertisements BEFORE UPDATE ON public.advertisements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: products trg_notify_all_on_new_product; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_notify_all_on_new_product AFTER INSERT ON public.products FOR EACH ROW EXECUTE FUNCTION public.notify_all_on_new_product();


--
-- Name: orders trg_notify_buyer_on_order; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_notify_buyer_on_order AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.notify_buyer_on_order();


--
-- Name: orders trg_notify_buyer_on_status_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_notify_buyer_on_status_update AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.notify_buyer_on_status_update();


--
-- Name: order_items trg_notify_sellers_on_order; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_notify_sellers_on_order AFTER INSERT ON public.order_items FOR EACH STATEMENT EXECUTE FUNCTION public.notify_sellers_on_order();


--
-- Name: transactions trg_set_has_business_card_true; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_set_has_business_card_true AFTER INSERT OR UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.set_has_business_card_true();


--
-- Name: jobs trigger_add_job_to_approval_queue; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_add_job_to_approval_queue AFTER INSERT ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.add_job_to_approval_queue();


--
-- Name: profiles trigger_award_daily_login_points; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_award_daily_login_points AFTER UPDATE OF last_login ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.trigger_award_daily_login_points_fn();


--
-- Name: notifications trigger_broadcast_notification; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_broadcast_notification AFTER INSERT ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.broadcast_notification();


--
-- Name: events trigger_notify_admins_on_event_request; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_notify_admins_on_event_request AFTER INSERT ON public.events FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_event_request();


--
-- Name: jobs trigger_notify_admins_on_job_post; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_notify_admins_on_job_post AFTER INSERT ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_job_post();


--
-- Name: discussion_comments trigger_notify_bookmarkers_on_reply; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_notify_bookmarkers_on_reply AFTER INSERT ON public.discussion_comments FOR EACH ROW EXECUTE FUNCTION public.notify_bookmarkers_on_reply();


--
-- Name: job_approval_queue trigger_notify_job_poster_on_approval_change; Type: TRIGGER; Schema: public; Owner: supabase_admin
--

CREATE TRIGGER trigger_notify_job_poster_on_approval_change AFTER UPDATE ON public.job_approval_queue FOR EACH ROW EXECUTE FUNCTION public.notify_job_poster_on_approval_change();


--
-- Name: events trigger_notify_user_on_event_status_change; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_notify_user_on_event_status_change AFTER UPDATE OF status ON public.events FOR EACH ROW EXECUTE FUNCTION public.notify_user_on_event_status_change();


--
-- Name: profiles trigger_set_avc_id_on_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_set_avc_id_on_insert BEFORE INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_avc_id_on_insert();


--
-- Name: discussion_comments trigger_update_discussion_counters; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_discussion_counters AFTER INSERT OR DELETE ON public.discussion_comments FOR EACH ROW EXECUTE FUNCTION public.update_discussion_counters();


--
-- Name: notification_templates trigger_update_notification_templates_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_notification_templates_updated_at BEFORE UPDATE ON public.notification_templates FOR EACH ROW EXECUTE FUNCTION public.update_notifications_updated_at();


--
-- Name: notifications trigger_update_notifications_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_notifications_updated_at();


--
-- Name: discussion_poll_votes trigger_update_poll_vote_counts; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_poll_vote_counts AFTER INSERT OR DELETE ON public.discussion_poll_votes FOR EACH ROW EXECUTE FUNCTION public.update_poll_vote_counts();


--
-- Name: user_notification_preferences trigger_update_user_notification_preferences_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_user_notification_preferences_updated_at BEFORE UPDATE ON public.user_notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_notifications_updated_at();


--
-- Name: discussion_votes trigger_update_vote_scores; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_vote_scores AFTER INSERT OR DELETE OR UPDATE ON public.discussion_votes FOR EACH ROW EXECUTE FUNCTION public.update_vote_scores();


--
-- Name: jobs tsvectorupdate; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.jobs_fts_trigger();


--
-- Name: cart_items update_cart_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cart update_cart_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON public.cart FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: job_applications update_job_applications_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON public.job_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: jobs update_jobs_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: order_items update_order_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: transactions update_points_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_points_trigger AFTER INSERT OR DELETE OR UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_points_from_transaction();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: extensions extensions_tenant_external_id_fkey; Type: FK CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_tenant_external_id_fkey FOREIGN KEY (tenant_external_id) REFERENCES _realtime.tenants(external_id) ON DELETE CASCADE;


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: addresses addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.cart(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: cart cart_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: certifications certifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT certifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: discussion_attachments discussion_attachments_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_attachments
    ADD CONSTRAINT discussion_attachments_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.discussion_comments(id) ON DELETE CASCADE;


--
-- Name: discussion_attachments discussion_attachments_discussion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_attachments
    ADD CONSTRAINT discussion_attachments_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES public.discussions(id) ON DELETE CASCADE;


--
-- Name: discussion_attachments discussion_attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_attachments
    ADD CONSTRAINT discussion_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: discussion_bookmarks discussion_bookmarks_discussion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_bookmarks
    ADD CONSTRAINT discussion_bookmarks_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES public.discussions(id) ON DELETE CASCADE;


--
-- Name: discussion_bookmarks discussion_bookmarks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_bookmarks
    ADD CONSTRAINT discussion_bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: discussion_comments discussion_comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_comments
    ADD CONSTRAINT discussion_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: discussion_comments discussion_comments_discussion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_comments
    ADD CONSTRAINT discussion_comments_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES public.discussions(id) ON DELETE CASCADE;


--
-- Name: discussion_comments discussion_comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_comments
    ADD CONSTRAINT discussion_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.discussion_comments(id) ON DELETE CASCADE;


--
-- Name: discussion_poll_options discussion_poll_options_poll_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_poll_options
    ADD CONSTRAINT discussion_poll_options_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.discussion_polls(id) ON DELETE CASCADE;


--
-- Name: discussion_poll_votes discussion_poll_votes_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_poll_votes
    ADD CONSTRAINT discussion_poll_votes_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.discussion_poll_options(id) ON DELETE CASCADE;


--
-- Name: discussion_poll_votes discussion_poll_votes_poll_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_poll_votes
    ADD CONSTRAINT discussion_poll_votes_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.discussion_polls(id) ON DELETE CASCADE;


--
-- Name: discussion_poll_votes discussion_poll_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_poll_votes
    ADD CONSTRAINT discussion_poll_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: discussion_polls discussion_polls_discussion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_polls
    ADD CONSTRAINT discussion_polls_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES public.discussions(id) ON DELETE CASCADE;


--
-- Name: discussion_reports discussion_reports_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_reports
    ADD CONSTRAINT discussion_reports_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.discussion_comments(id) ON DELETE CASCADE;


--
-- Name: discussion_reports discussion_reports_discussion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_reports
    ADD CONSTRAINT discussion_reports_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES public.discussions(id) ON DELETE CASCADE;


--
-- Name: discussion_shares discussion_shares_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_shares
    ADD CONSTRAINT discussion_shares_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.discussion_comments(id) ON DELETE CASCADE;


--
-- Name: discussion_shares discussion_shares_discussion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_shares
    ADD CONSTRAINT discussion_shares_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES public.discussions(id) ON DELETE CASCADE;


--
-- Name: discussion_views discussion_views_discussion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_views
    ADD CONSTRAINT discussion_views_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES public.discussions(id) ON DELETE CASCADE;


--
-- Name: discussion_votes discussion_votes_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_votes
    ADD CONSTRAINT discussion_votes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.discussion_comments(id) ON DELETE CASCADE;


--
-- Name: discussion_votes discussion_votes_discussion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_votes
    ADD CONSTRAINT discussion_votes_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES public.discussions(id) ON DELETE CASCADE;


--
-- Name: discussion_votes discussion_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussion_votes
    ADD CONSTRAINT discussion_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: discussions discussions_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT discussions_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: discussions discussions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT discussions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.discussion_categories(id) ON DELETE SET NULL;


--
-- Name: education education_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.education
    ADD CONSTRAINT education_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: employment employment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employment
    ADD CONSTRAINT employment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: event_logs event_logs_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_logs
    ADD CONSTRAINT event_logs_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_logs event_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_logs
    ADD CONSTRAINT event_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: events events_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.profiles(id);


--
-- Name: job_applications job_applications_applicant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: job_applications job_applications_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_approval_queue job_approval_queue_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.job_approval_queue
    ADD CONSTRAINT job_approval_queue_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.profiles(id);


--
-- Name: job_approval_queue job_approval_queue_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.job_approval_queue
    ADD CONSTRAINT job_approval_queue_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: jobs jobs_posted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_posted_by_fkey FOREIGN KEY (posted_by) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: notification_delivery_log notification_delivery_log_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_delivery_log
    ADD CONSTRAINT notification_delivery_log_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE CASCADE;


--
-- Name: notification_settings notification_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: order_items order_items_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES auth.users(id);


--
-- Name: orders orders_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: points points_category_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points
    ADD CONSTRAINT points_category_fkey FOREIGN KEY (category) REFERENCES public.points_categories(id);


--
-- Name: points points_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points
    ADD CONSTRAINT points_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: products products_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.review_categories(id) ON DELETE SET NULL;


--
-- Name: products products_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profile_completion profile_completion_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_completion
    ADD CONSTRAINT profile_completion_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: review_comments review_comments_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_comments
    ADD CONSTRAINT review_comments_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: review_comments review_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_comments
    ADD CONSTRAINT review_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: review_products review_products_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_products
    ADD CONSTRAINT review_products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;


--
-- Name: review_products review_products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_products
    ADD CONSTRAINT review_products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.review_categories(id) ON DELETE SET NULL;


--
-- Name: review_requests review_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_requests
    ADD CONSTRAINT review_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.review_categories(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.review_products(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: reward_purchases reward_purchases_reward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reward_purchases
    ADD CONSTRAINT reward_purchases_reward_id_fkey FOREIGN KEY (reward_id) REFERENCES public.rewards(id) ON DELETE CASCADE;


--
-- Name: reward_purchases reward_purchases_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reward_purchases
    ADD CONSTRAINT reward_purchases_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE;


--
-- Name: reward_purchases reward_purchases_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reward_purchases
    ADD CONSTRAINT reward_purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: social_links social_links_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_links
    ADD CONSTRAINT social_links_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: training_enrollments training_enrollments_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.training_enrollments
    ADD CONSTRAINT training_enrollments_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.training_programs(id);


--
-- Name: transactions transactions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.points_categories(id);


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: training_enrollments Admins can delete enrollments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can delete enrollments" ON public.training_enrollments FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: training_enrollments Admins can insert enrollments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can insert enrollments" ON public.training_enrollments FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: training_enrollments Admins can update enrollments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can update enrollments" ON public.training_enrollments FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: training_enrollments Admins can view all enrollments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all enrollments" ON public.training_enrollments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: order_items Admins can view all order items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: orders Admins can view all orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: events Allow admins to update events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow admins to update events" ON public.events FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: training_enrollments Allow all insert into training_enrollments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all insert into training_enrollments" ON public.training_enrollments FOR INSERT WITH CHECK (true);


--
-- Name: contact_responses Allow all operations on contact_responses; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "Allow all operations on contact_responses" ON public.contact_responses USING (true) WITH CHECK (true);


--
-- Name: landing_emails Allow all operations on landing_emails; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "Allow all operations on landing_emails" ON public.landing_emails USING (true) WITH CHECK (true);


--
-- Name: events Allow authenticated users to insert events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow authenticated users to insert events" ON public.events FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: order_items Anonymous users can insert order items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anonymous users can insert order items" ON public.order_items FOR INSERT TO anon WITH CHECK (true);


--
-- Name: order_items Anonymous users can select order items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anonymous users can select order items" ON public.order_items FOR SELECT TO anon USING (true);


--
-- Name: jobs Anyone can view active jobs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active jobs" ON public.jobs FOR SELECT TO authenticated, anon USING ((is_active = true));


--
-- Name: training_programs Anyone can view active training programs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active training programs" ON public.training_programs FOR SELECT USING ((is_active = true));


--
-- Name: job_applications Authenticated users can apply for jobs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can apply for jobs" ON public.job_applications FOR INSERT TO authenticated WITH CHECK ((applicant_id = auth.uid()));


--
-- Name: order_items Authenticated users can insert order items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can insert order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: jobs Authenticated users can post jobs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can post jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK ((posted_by = auth.uid()));


--
-- Name: order_items Authenticated users can select order items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can select order items" ON public.order_items FOR SELECT TO authenticated USING (true);


--
-- Name: job_applications Job posters can update application status; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Job posters can update application status" ON public.job_applications FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.jobs
  WHERE ((jobs.id = job_applications.job_id) AND (jobs.posted_by = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.jobs
  WHERE ((jobs.id = job_applications.job_id) AND (jobs.posted_by = auth.uid())))));


--
-- Name: job_applications Job posters can view applications for their jobs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Job posters can view applications for their jobs" ON public.job_applications FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.jobs
  WHERE ((jobs.id = job_applications.job_id) AND (jobs.posted_by = auth.uid())))));


--
-- Name: points_categories Points categories are manageable by admins; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Points categories are manageable by admins" ON public.points_categories TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: points_categories Points categories are viewable by authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Points categories are viewable by authenticated users" ON public.points_categories FOR SELECT TO authenticated USING (true);


--
-- Name: order_items Sellers can view their product orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Sellers can view their product orders" ON public.order_items FOR SELECT USING ((seller_id = auth.uid()));


--
-- Name: addresses Users can delete their own addresses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own addresses" ON public.addresses FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: cart Users can delete their own cart; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own cart" ON public.cart FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: cart_items Users can delete their own cart items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own cart items" ON public.cart_items FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.cart
  WHERE ((cart.id = cart_items.cart_id) AND (cart.user_id = auth.uid())))));


--
-- Name: jobs Users can delete their own jobs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own jobs" ON public.jobs FOR DELETE TO authenticated USING ((posted_by = auth.uid()));


--
-- Name: cart_items Users can insert items to their own cart; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert items to their own cart" ON public.cart_items FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.cart
  WHERE ((cart.id = cart_items.cart_id) AND (cart.user_id = auth.uid())))));


--
-- Name: order_items Users can insert items to their own orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert items to their own orders" ON public.order_items FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));


--
-- Name: addresses Users can insert their own addresses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own addresses" ON public.addresses FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: cart Users can insert their own cart; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own cart" ON public.cart FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: training_enrollments Users can insert their own enrollments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own enrollments" ON public.training_enrollments FOR INSERT WITH CHECK (((auth.jwt() ->> 'email'::text) = email));


--
-- Name: notification_settings Users can insert their own notification settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own notification settings" ON public.notification_settings FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: orders Users can insert their own orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: points Users can insert their own points; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own points" ON public.points FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: reward_purchases Users can insert their own reward purchases; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own reward purchases" ON public.reward_purchases FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: reward_purchases Users can select their own reward purchases; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can select their own reward purchases" ON public.reward_purchases FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: addresses Users can update their own addresses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own addresses" ON public.addresses FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: cart Users can update their own cart; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own cart" ON public.cart FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: cart_items Users can update their own cart items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own cart items" ON public.cart_items FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.cart
  WHERE ((cart.id = cart_items.cart_id) AND (cart.user_id = auth.uid())))));


--
-- Name: training_enrollments Users can update their own enrollments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own enrollments" ON public.training_enrollments FOR UPDATE USING (((auth.jwt() ->> 'email'::text) = email));


--
-- Name: jobs Users can update their own jobs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own jobs" ON public.jobs FOR UPDATE TO authenticated USING ((posted_by = auth.uid())) WITH CHECK ((posted_by = auth.uid()));


--
-- Name: notification_settings Users can update their own notification settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own notification settings" ON public.notification_settings FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: order_items Users can update their own order items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own order items" ON public.order_items FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));


--
-- Name: orders Users can update their own orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own orders" ON public.orders FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: points Users can update their own points; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own points" ON public.points FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: addresses Users can view their own addresses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own addresses" ON public.addresses FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: job_applications Users can view their own applications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own applications" ON public.job_applications FOR SELECT TO authenticated USING ((applicant_id = auth.uid()));


--
-- Name: cart Users can view their own cart; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own cart" ON public.cart FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: cart_items Users can view their own cart items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own cart items" ON public.cart_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.cart
  WHERE ((cart.id = cart_items.cart_id) AND (cart.user_id = auth.uid())))));


--
-- Name: training_enrollments Users can view their own enrollments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own enrollments" ON public.training_enrollments FOR SELECT USING (((auth.jwt() ->> 'email'::text) = email));


--
-- Name: jobs Users can view their own jobs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own jobs" ON public.jobs FOR SELECT TO authenticated USING ((posted_by = auth.uid()));


--
-- Name: notification_settings Users can view their own notification settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own notification settings" ON public.notification_settings FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: order_items Users can view their own order items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));


--
-- Name: orders Users can view their own orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: points Users can view their own points; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own points" ON public.points FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: event_logs admin_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_delete ON public.event_logs FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: notification_delivery_log admin_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_delete ON public.notification_delivery_log FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: event_logs admin_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_insert ON public.event_logs FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: notification_delivery_log admin_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_insert ON public.notification_delivery_log FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: event_logs admin_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_select ON public.event_logs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: notification_delivery_log admin_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_select ON public.notification_delivery_log FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: event_logs admin_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_update ON public.event_logs FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: notification_delivery_log admin_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_update ON public.notification_delivery_log FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: profiles allow_update_has_business_card_by_anyone; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY allow_update_has_business_card_by_anyone ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);


--
-- Name: advertisements anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.advertisements FOR SELECT USING (true);


--
-- Name: discussion_attachments anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.discussion_attachments FOR SELECT USING (true);


--
-- Name: discussion_bookmarks anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.discussion_bookmarks FOR SELECT USING (true);


--
-- Name: discussion_categories anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.discussion_categories FOR SELECT USING (true);


--
-- Name: discussion_comments anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.discussion_comments FOR SELECT USING (true);


--
-- Name: discussion_poll_options anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.discussion_poll_options FOR SELECT USING (true);


--
-- Name: discussion_poll_votes anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.discussion_poll_votes FOR SELECT USING (true);


--
-- Name: discussion_polls anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.discussion_polls FOR SELECT USING (true);


--
-- Name: discussion_reports anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.discussion_reports FOR SELECT USING (true);


--
-- Name: discussion_shares anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.discussion_shares FOR SELECT USING (true);


--
-- Name: discussion_views anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.discussion_views FOR SELECT USING (true);


--
-- Name: discussion_votes anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.discussion_votes FOR SELECT USING (true);


--
-- Name: discussions anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.discussions FOR SELECT USING (true);


--
-- Name: events anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.events FOR SELECT USING (true);


--
-- Name: jobs anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.jobs FOR SELECT USING (true);


--
-- Name: notification_templates anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.notification_templates FOR SELECT USING (true);


--
-- Name: points_categories anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.points_categories FOR SELECT USING (true);


--
-- Name: product_categories anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.product_categories FOR SELECT USING (true);


--
-- Name: products anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.products FOR SELECT USING (true);


--
-- Name: profiles anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.profiles FOR SELECT USING ((is_public = true));


--
-- Name: rewards anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.rewards FOR SELECT USING (true);


--
-- Name: training_programs anon_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY anon_select ON public.training_programs FOR SELECT USING (true);


--
-- Name: discussion_attachments authenticated_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_delete_own ON public.discussion_attachments FOR DELETE TO authenticated USING ((auth.uid() = uploaded_by));


--
-- Name: discussion_bookmarks authenticated_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_delete_own ON public.discussion_bookmarks FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: discussion_comments authenticated_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_delete_own ON public.discussion_comments FOR DELETE TO authenticated USING ((auth.uid() = author_id));


--
-- Name: discussion_poll_votes authenticated_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_delete_own ON public.discussion_poll_votes FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: discussion_polls authenticated_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_delete_own ON public.discussion_polls FOR DELETE TO authenticated USING ((auth.uid() = ( SELECT discussions.author_id
   FROM public.discussions
  WHERE (discussions.id = discussion_polls.discussion_id))));


--
-- Name: discussion_reports authenticated_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_delete_own ON public.discussion_reports FOR DELETE TO authenticated USING ((auth.uid() = reporter_id));


--
-- Name: discussion_shares authenticated_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_delete_own ON public.discussion_shares FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: discussion_views authenticated_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_delete_own ON public.discussion_views FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: discussion_votes authenticated_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_delete_own ON public.discussion_votes FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: discussions authenticated_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_delete_own ON public.discussions FOR DELETE TO authenticated USING ((auth.uid() = author_id));


--
-- Name: discussion_poll_votes authenticated_delete_own_votes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_delete_own_votes ON public.discussion_poll_votes FOR DELETE TO authenticated USING ((user_id = auth.uid()));


--
-- Name: discussion_attachments authenticated_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_insert ON public.discussion_attachments FOR INSERT TO authenticated WITH CHECK ((auth.uid() = uploaded_by));


--
-- Name: discussion_bookmarks authenticated_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_insert ON public.discussion_bookmarks FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: discussion_comments authenticated_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_insert ON public.discussion_comments FOR INSERT TO authenticated WITH CHECK ((auth.uid() = author_id));


--
-- Name: discussion_poll_votes authenticated_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_insert ON public.discussion_poll_votes FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: discussion_polls authenticated_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_insert ON public.discussion_polls FOR INSERT TO authenticated WITH CHECK ((auth.uid() = ( SELECT discussions.author_id
   FROM public.discussions
  WHERE (discussions.id = discussion_polls.discussion_id))));


--
-- Name: discussion_reports authenticated_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_insert ON public.discussion_reports FOR INSERT TO authenticated WITH CHECK ((auth.uid() = reporter_id));


--
-- Name: discussion_shares authenticated_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_insert ON public.discussion_shares FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: discussion_views authenticated_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_insert ON public.discussion_views FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: discussion_votes authenticated_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_insert ON public.discussion_votes FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: discussions authenticated_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_insert ON public.discussions FOR INSERT TO authenticated WITH CHECK ((auth.uid() = author_id));


--
-- Name: discussion_poll_options authenticated_insert_poll_options; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_insert_poll_options ON public.discussion_poll_options FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: discussion_polls authenticated_insert_polls; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_insert_polls ON public.discussion_polls FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: discussion_poll_votes authenticated_insert_votes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_insert_votes ON public.discussion_poll_votes FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: discussion_attachments authenticated_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_select ON public.discussion_attachments FOR SELECT TO authenticated USING (true);


--
-- Name: discussion_bookmarks authenticated_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_select ON public.discussion_bookmarks FOR SELECT TO authenticated USING (true);


--
-- Name: discussion_categories authenticated_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_select ON public.discussion_categories FOR SELECT TO authenticated USING (true);


--
-- Name: discussion_comments authenticated_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_select ON public.discussion_comments FOR SELECT TO authenticated USING (true);


--
-- Name: discussion_poll_options authenticated_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_select ON public.discussion_poll_options FOR SELECT TO authenticated USING (true);


--
-- Name: discussion_poll_votes authenticated_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_select ON public.discussion_poll_votes FOR SELECT TO authenticated USING (true);


--
-- Name: discussion_polls authenticated_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_select ON public.discussion_polls FOR SELECT TO authenticated USING (true);


--
-- Name: discussion_reports authenticated_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_select ON public.discussion_reports FOR SELECT TO authenticated USING (true);


--
-- Name: discussion_shares authenticated_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_select ON public.discussion_shares FOR SELECT TO authenticated USING (true);


--
-- Name: discussion_views authenticated_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_select ON public.discussion_views FOR SELECT TO authenticated USING (true);


--
-- Name: discussion_votes authenticated_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_select ON public.discussion_votes FOR SELECT TO authenticated USING (true);


--
-- Name: discussions authenticated_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_select ON public.discussions FOR SELECT TO authenticated USING (true);


--
-- Name: discussion_poll_votes authenticated_select_own_votes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_select_own_votes ON public.discussion_poll_votes FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: discussion_poll_options authenticated_select_poll_options; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_select_poll_options ON public.discussion_poll_options FOR SELECT TO authenticated USING (true);


--
-- Name: discussion_polls authenticated_select_polls; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY authenticated_select_polls ON public.discussion_polls FOR SELECT TO authenticated USING (true);


--
-- Name: discussion_poll_options author_delete_poll_options; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY author_delete_poll_options ON public.discussion_poll_options FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.discussion_polls dp
     JOIN public.discussions d ON ((d.id = dp.discussion_id)))
  WHERE ((dp.id = discussion_poll_options.poll_id) AND (d.author_id = auth.uid())))));


--
-- Name: discussion_polls author_delete_polls; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY author_delete_polls ON public.discussion_polls FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.discussions
  WHERE ((discussions.id = discussion_polls.discussion_id) AND (discussions.author_id = auth.uid())))));


--
-- Name: discussion_poll_options author_update_poll_options; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY author_update_poll_options ON public.discussion_poll_options FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.discussion_polls dp
     JOIN public.discussions d ON ((d.id = dp.discussion_id)))
  WHERE ((dp.id = discussion_poll_options.poll_id) AND (d.author_id = auth.uid())))));


--
-- Name: discussion_polls author_update_polls; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY author_update_polls ON public.discussion_polls FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.discussions
  WHERE ((discussions.id = discussion_polls.discussion_id) AND (discussions.author_id = auth.uid())))));


--
-- Name: cart_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

--
-- Name: certifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

--
-- Name: contact_responses; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE public.contact_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: event_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.event_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: job_applications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

--
-- Name: jobs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: landing_emails; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE public.landing_emails ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_templates; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: order_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: job_applications owner_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY owner_delete ON public.job_applications FOR DELETE USING ((applicant_id = auth.uid()));


--
-- Name: job_applications owner_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY owner_insert ON public.job_applications FOR INSERT WITH CHECK ((applicant_id = auth.uid()));


--
-- Name: job_applications owner_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY owner_select ON public.job_applications FOR SELECT USING ((applicant_id = auth.uid()));


--
-- Name: job_applications owner_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY owner_update ON public.job_applications FOR UPDATE USING ((applicant_id = auth.uid()));


--
-- Name: points_categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.points_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: product_categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: products public_read_products; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY public_read_products ON public.products FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = products.seller_id) AND (p.is_public = true)))));


--
-- Name: rewards; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

--
-- Name: products seller_manage_own_products; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY seller_manage_own_products ON public.products USING (((auth.uid() = seller_id) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = products.seller_id) AND (p.is_public = true))))));


--
-- Name: social_links; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

--
-- Name: training_enrollments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.training_enrollments ENABLE ROW LEVEL SECURITY;

--
-- Name: training_programs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;

--
-- Name: transactions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: addresses user_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_delete ON public.addresses FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: certifications user_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_delete ON public.certifications FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: education user_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_delete ON public.education FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: employment user_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_delete ON public.employment FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: notification_settings user_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_delete ON public.notification_settings FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: notifications user_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_delete ON public.notifications FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: points user_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_delete ON public.points FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: profile_completion user_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_delete ON public.profile_completion FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: reward_purchases user_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_delete ON public.reward_purchases FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: social_links user_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_delete ON public.social_links FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: transactions user_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_delete ON public.transactions FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: user_notification_preferences user_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_delete ON public.user_notification_preferences FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: addresses user_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_insert ON public.addresses FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: certifications user_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_insert ON public.certifications FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: education user_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_insert ON public.education FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: employment user_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_insert ON public.employment FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: notification_settings user_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_insert ON public.notification_settings FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: notifications user_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_insert ON public.notifications FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: points user_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_insert ON public.points FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: profile_completion user_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_insert ON public.profile_completion FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: social_links user_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_insert ON public.social_links FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: transactions user_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_insert ON public.transactions FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: user_notification_preferences user_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_insert ON public.user_notification_preferences FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: addresses user_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_select ON public.addresses FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: certifications user_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_select ON public.certifications FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: education user_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_select ON public.education FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: employment user_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_select ON public.employment FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: notification_settings user_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_select ON public.notification_settings FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: notifications user_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_select ON public.notifications FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: points user_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_select ON public.points FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: profile_completion user_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_select ON public.profile_completion FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: social_links user_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_select ON public.social_links FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: transactions user_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_select ON public.transactions FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: user_notification_preferences user_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_select ON public.user_notification_preferences FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: addresses user_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_update ON public.addresses FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: certifications user_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_update ON public.certifications FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: education user_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_update ON public.education FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: employment user_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_update ON public.employment FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: notification_settings user_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_update ON public.notification_settings FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: notifications user_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_update ON public.notifications FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: points user_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_update ON public.points FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: profile_completion user_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_update ON public.profile_completion FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: reward_purchases user_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_update ON public.reward_purchases FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: social_links user_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_update ON public.social_links FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: transactions user_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_update ON public.transactions FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: user_notification_preferences user_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_update ON public.user_notification_preferences FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: objects test 1oj01fe_0; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "test 1oj01fe_0" ON storage.objects FOR INSERT TO anon WITH CHECK ((bucket_id = 'avatars'::text));


--
-- Name: objects test 1oj01fe_1; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "test 1oj01fe_1" ON storage.objects FOR SELECT TO anon USING ((bucket_id = 'avatars'::text));


--
-- Name: objects test 1oj01fe_2; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "test 1oj01fe_2" ON storage.objects FOR UPDATE TO anon USING ((bucket_id = 'avatars'::text));


--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: supabase_admin
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime_messages_publication OWNER TO supabase_admin;

--
-- Name: supabase_realtime notification_delivery_log; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.notification_delivery_log;


--
-- Name: supabase_realtime notifications; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.notifications;


--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: supabase_admin
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT ALL ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA cron; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA cron TO postgres WITH GRANT OPTION;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA net; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA net TO supabase_functions_admin;
GRANT USAGE ON SCHEMA net TO postgres;
GRANT USAGE ON SCHEMA net TO anon;
GRANT USAGE ON SCHEMA net TO authenticated;
GRANT USAGE ON SCHEMA net TO service_role;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT ALL ON SCHEMA storage TO postgres;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA supabase_functions; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA supabase_functions TO postgres;
GRANT USAGE ON SCHEMA supabase_functions TO anon;
GRANT USAGE ON SCHEMA supabase_functions TO authenticated;
GRANT USAGE ON SCHEMA supabase_functions TO service_role;
GRANT ALL ON SCHEMA supabase_functions TO supabase_functions_admin;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION alter_job(job_id bigint, schedule text, command text, database text, username text, active boolean); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.alter_job(job_id bigint, schedule text, command text, database text, username text, active boolean) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION job_cache_invalidate(); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.job_cache_invalidate() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION schedule(schedule text, command text); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.schedule(schedule text, command text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION schedule(job_name text, schedule text, command text); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.schedule(job_name text, schedule text, command text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION schedule_in_database(job_name text, schedule text, command text, database text, username text, active boolean); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.schedule_in_database(job_name text, schedule text, command text, database text, username text, active boolean) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION unschedule(job_id bigint); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.unschedule(job_id bigint) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION unschedule(job_name text); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.unschedule(job_name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION algorithm_sign(signables text, secret text, algorithm text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.algorithm_sign(signables text, secret text, algorithm text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.algorithm_sign(signables text, secret text, algorithm text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM postgres;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM postgres;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hypopg(OUT indexname text, OUT indexrelid oid, OUT indrelid oid, OUT innatts integer, OUT indisunique boolean, OUT indkey int2vector, OUT indcollation oidvector, OUT indclass oidvector, OUT indoption oidvector, OUT indexprs pg_node_tree, OUT indpred pg_node_tree, OUT amid oid); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hypopg(OUT indexname text, OUT indexrelid oid, OUT indrelid oid, OUT innatts integer, OUT indisunique boolean, OUT indkey int2vector, OUT indcollation oidvector, OUT indclass oidvector, OUT indoption oidvector, OUT indexprs pg_node_tree, OUT indpred pg_node_tree, OUT amid oid) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hypopg_create_index(sql_order text, OUT indexrelid oid, OUT indexname text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hypopg_create_index(sql_order text, OUT indexrelid oid, OUT indexname text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hypopg_drop_index(indexid oid); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hypopg_drop_index(indexid oid) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hypopg_get_indexdef(indexid oid); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hypopg_get_indexdef(indexid oid) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hypopg_hidden_indexes(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hypopg_hidden_indexes() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hypopg_hide_index(indexid oid); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hypopg_hide_index(indexid oid) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hypopg_relation_size(indexid oid); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hypopg_relation_size(indexid oid) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hypopg_reset(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hypopg_reset() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hypopg_reset_index(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hypopg_reset_index() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hypopg_unhide_all_indexes(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hypopg_unhide_all_indexes() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hypopg_unhide_index(indexid oid); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hypopg_unhide_index(indexid oid) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION index_advisor(query text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.index_advisor(query text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT blk_read_time double precision, OUT blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT blk_read_time double precision, OUT blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION sign(payload json, secret text, algorithm text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.sign(payload json, secret text, algorithm text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.sign(payload json, secret text, algorithm text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION try_cast_double(inp text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.try_cast_double(inp text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.try_cast_double(inp text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION url_decode(data text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.url_decode(data text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.url_decode(data text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION url_encode(data bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.url_encode(data bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.url_encode(data bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION verify(token text, secret text, algorithm text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.verify(token text, secret text, algorithm text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.verify(token text, secret text, algorithm text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- Name: FUNCTION add_job_to_approval_queue(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.add_job_to_approval_queue() TO postgres;
GRANT ALL ON FUNCTION public.add_job_to_approval_queue() TO anon;
GRANT ALL ON FUNCTION public.add_job_to_approval_queue() TO authenticated;
GRANT ALL ON FUNCTION public.add_job_to_approval_queue() TO service_role;


--
-- Name: FUNCTION add_to_cart(user_uuid uuid, product_uuid uuid, item_quantity integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.add_to_cart(user_uuid uuid, product_uuid uuid, item_quantity integer) TO anon;
GRANT ALL ON FUNCTION public.add_to_cart(user_uuid uuid, product_uuid uuid, item_quantity integer) TO authenticated;
GRANT ALL ON FUNCTION public.add_to_cart(user_uuid uuid, product_uuid uuid, item_quantity integer) TO service_role;


--
-- Name: FUNCTION award_daily_login_points(user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.award_daily_login_points(user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.award_daily_login_points(user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.award_daily_login_points(user_id uuid) TO service_role;


--
-- Name: FUNCTION award_points_with_category(p_user_id uuid, p_amount integer, p_category_name text, p_reason text, p_metadata jsonb); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.award_points_with_category(p_user_id uuid, p_amount integer, p_category_name text, p_reason text, p_metadata jsonb) TO postgres;
GRANT ALL ON FUNCTION public.award_points_with_category(p_user_id uuid, p_amount integer, p_category_name text, p_reason text, p_metadata jsonb) TO anon;
GRANT ALL ON FUNCTION public.award_points_with_category(p_user_id uuid, p_amount integer, p_category_name text, p_reason text, p_metadata jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.award_points_with_category(p_user_id uuid, p_amount integer, p_category_name text, p_reason text, p_metadata jsonb) TO service_role;


--
-- Name: FUNCTION begin_transaction(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.begin_transaction() TO postgres;
GRANT ALL ON FUNCTION public.begin_transaction() TO anon;
GRANT ALL ON FUNCTION public.begin_transaction() TO authenticated;
GRANT ALL ON FUNCTION public.begin_transaction() TO service_role;


--
-- Name: FUNCTION broadcast_notification(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.broadcast_notification() TO anon;
GRANT ALL ON FUNCTION public.broadcast_notification() TO authenticated;
GRANT ALL ON FUNCTION public.broadcast_notification() TO service_role;


--
-- Name: FUNCTION cleanup_expired_notifications(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.cleanup_expired_notifications() TO anon;
GRANT ALL ON FUNCTION public.cleanup_expired_notifications() TO authenticated;
GRANT ALL ON FUNCTION public.cleanup_expired_notifications() TO service_role;


--
-- Name: FUNCTION cleanup_read_notifications(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.cleanup_read_notifications() TO postgres;
GRANT ALL ON FUNCTION public.cleanup_read_notifications() TO anon;
GRANT ALL ON FUNCTION public.cleanup_read_notifications() TO authenticated;
GRANT ALL ON FUNCTION public.cleanup_read_notifications() TO service_role;


--
-- Name: FUNCTION clear_cart(user_uuid uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.clear_cart(user_uuid uuid) TO anon;
GRANT ALL ON FUNCTION public.clear_cart(user_uuid uuid) TO authenticated;
GRANT ALL ON FUNCTION public.clear_cart(user_uuid uuid) TO service_role;


--
-- Name: FUNCTION commit_transaction(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.commit_transaction() TO postgres;
GRANT ALL ON FUNCTION public.commit_transaction() TO anon;
GRANT ALL ON FUNCTION public.commit_transaction() TO authenticated;
GRANT ALL ON FUNCTION public.commit_transaction() TO service_role;


--
-- Name: FUNCTION create_missing_profiles(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_missing_profiles() TO anon;
GRANT ALL ON FUNCTION public.create_missing_profiles() TO authenticated;
GRANT ALL ON FUNCTION public.create_missing_profiles() TO service_role;


--
-- Name: FUNCTION create_order_from_cart(user_uuid uuid, shipping_addr jsonb, billing_addr jsonb, payment_method_val text, points_to_use integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_order_from_cart(user_uuid uuid, shipping_addr jsonb, billing_addr jsonb, payment_method_val text, points_to_use integer) TO anon;
GRANT ALL ON FUNCTION public.create_order_from_cart(user_uuid uuid, shipping_addr jsonb, billing_addr jsonb, payment_method_val text, points_to_use integer) TO authenticated;
GRANT ALL ON FUNCTION public.create_order_from_cart(user_uuid uuid, shipping_addr jsonb, billing_addr jsonb, payment_method_val text, points_to_use integer) TO service_role;


--
-- Name: FUNCTION generate_avc_id(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.generate_avc_id() TO postgres;
GRANT ALL ON FUNCTION public.generate_avc_id() TO anon;
GRANT ALL ON FUNCTION public.generate_avc_id() TO authenticated;
GRANT ALL ON FUNCTION public.generate_avc_id() TO service_role;


--
-- Name: FUNCTION generate_order_number(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.generate_order_number() TO anon;
GRANT ALL ON FUNCTION public.generate_order_number() TO authenticated;
GRANT ALL ON FUNCTION public.generate_order_number() TO service_role;


--
-- Name: FUNCTION get_cart_item_count(user_uuid uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_cart_item_count(user_uuid uuid) TO anon;
GRANT ALL ON FUNCTION public.get_cart_item_count(user_uuid uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_cart_item_count(user_uuid uuid) TO service_role;


--
-- Name: FUNCTION get_cart_total(user_uuid uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_cart_total(user_uuid uuid) TO anon;
GRANT ALL ON FUNCTION public.get_cart_total(user_uuid uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_cart_total(user_uuid uuid) TO service_role;


--
-- Name: FUNCTION get_category_id_by_name(category_name text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_category_id_by_name(category_name text) TO anon;
GRANT ALL ON FUNCTION public.get_category_id_by_name(category_name text) TO authenticated;
GRANT ALL ON FUNCTION public.get_category_id_by_name(category_name text) TO service_role;


--
-- Name: FUNCTION get_category_points_stats(p_category_name text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_category_points_stats(p_category_name text) TO anon;
GRANT ALL ON FUNCTION public.get_category_points_stats(p_category_name text) TO authenticated;
GRANT ALL ON FUNCTION public.get_category_points_stats(p_category_name text) TO service_role;


--
-- Name: FUNCTION get_or_create_cart(user_uuid uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_or_create_cart(user_uuid uuid) TO anon;
GRANT ALL ON FUNCTION public.get_or_create_cart(user_uuid uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_or_create_cart(user_uuid uuid) TO service_role;


--
-- Name: FUNCTION get_user_points_by_all_categories(p_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_user_points_by_all_categories(p_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_user_points_by_all_categories(p_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_user_points_by_all_categories(p_user_id uuid) TO service_role;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: FUNCTION initialize_user_notification_settings(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.initialize_user_notification_settings() TO postgres;
GRANT ALL ON FUNCTION public.initialize_user_notification_settings() TO anon;
GRANT ALL ON FUNCTION public.initialize_user_notification_settings() TO authenticated;
GRANT ALL ON FUNCTION public.initialize_user_notification_settings() TO service_role;


--
-- Name: FUNCTION initialize_user_points(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.initialize_user_points() TO postgres;
GRANT ALL ON FUNCTION public.initialize_user_points() TO anon;
GRANT ALL ON FUNCTION public.initialize_user_points() TO authenticated;
GRANT ALL ON FUNCTION public.initialize_user_points() TO service_role;


--
-- Name: FUNCTION jobs_fts_trigger(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.jobs_fts_trigger() TO anon;
GRANT ALL ON FUNCTION public.jobs_fts_trigger() TO authenticated;
GRANT ALL ON FUNCTION public.jobs_fts_trigger() TO service_role;


--
-- Name: FUNCTION notify_admins_on_event_request(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.notify_admins_on_event_request() TO anon;
GRANT ALL ON FUNCTION public.notify_admins_on_event_request() TO authenticated;
GRANT ALL ON FUNCTION public.notify_admins_on_event_request() TO service_role;


--
-- Name: FUNCTION notify_admins_on_job_post(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.notify_admins_on_job_post() TO postgres;
GRANT ALL ON FUNCTION public.notify_admins_on_job_post() TO anon;
GRANT ALL ON FUNCTION public.notify_admins_on_job_post() TO authenticated;
GRANT ALL ON FUNCTION public.notify_admins_on_job_post() TO service_role;


--
-- Name: FUNCTION notify_all_on_new_product(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.notify_all_on_new_product() TO postgres;
GRANT ALL ON FUNCTION public.notify_all_on_new_product() TO anon;
GRANT ALL ON FUNCTION public.notify_all_on_new_product() TO authenticated;
GRANT ALL ON FUNCTION public.notify_all_on_new_product() TO service_role;


--
-- Name: FUNCTION notify_bookmarkers_on_reply(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.notify_bookmarkers_on_reply() TO anon;
GRANT ALL ON FUNCTION public.notify_bookmarkers_on_reply() TO authenticated;
GRANT ALL ON FUNCTION public.notify_bookmarkers_on_reply() TO service_role;


--
-- Name: FUNCTION notify_buyer_on_order(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.notify_buyer_on_order() TO postgres;
GRANT ALL ON FUNCTION public.notify_buyer_on_order() TO anon;
GRANT ALL ON FUNCTION public.notify_buyer_on_order() TO authenticated;
GRANT ALL ON FUNCTION public.notify_buyer_on_order() TO service_role;


--
-- Name: FUNCTION notify_buyer_on_status_update(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.notify_buyer_on_status_update() TO postgres;
GRANT ALL ON FUNCTION public.notify_buyer_on_status_update() TO anon;
GRANT ALL ON FUNCTION public.notify_buyer_on_status_update() TO authenticated;
GRANT ALL ON FUNCTION public.notify_buyer_on_status_update() TO service_role;


--
-- Name: FUNCTION notify_job_poster_on_approval_change(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.notify_job_poster_on_approval_change() TO postgres;
GRANT ALL ON FUNCTION public.notify_job_poster_on_approval_change() TO anon;
GRANT ALL ON FUNCTION public.notify_job_poster_on_approval_change() TO authenticated;
GRANT ALL ON FUNCTION public.notify_job_poster_on_approval_change() TO service_role;


--
-- Name: FUNCTION notify_sellers_on_order(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.notify_sellers_on_order() TO postgres;
GRANT ALL ON FUNCTION public.notify_sellers_on_order() TO anon;
GRANT ALL ON FUNCTION public.notify_sellers_on_order() TO authenticated;
GRANT ALL ON FUNCTION public.notify_sellers_on_order() TO service_role;


--
-- Name: FUNCTION notify_user_on_event_status_change(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.notify_user_on_event_status_change() TO anon;
GRANT ALL ON FUNCTION public.notify_user_on_event_status_change() TO authenticated;
GRANT ALL ON FUNCTION public.notify_user_on_event_status_change() TO service_role;


--
-- Name: FUNCTION populate_sample_products(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.populate_sample_products() TO anon;
GRANT ALL ON FUNCTION public.populate_sample_products() TO authenticated;
GRANT ALL ON FUNCTION public.populate_sample_products() TO service_role;


--
-- Name: FUNCTION rollback_transaction(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.rollback_transaction() TO postgres;
GRANT ALL ON FUNCTION public.rollback_transaction() TO anon;
GRANT ALL ON FUNCTION public.rollback_transaction() TO authenticated;
GRANT ALL ON FUNCTION public.rollback_transaction() TO service_role;


--
-- Name: FUNCTION set_avc_id_on_insert(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.set_avc_id_on_insert() TO anon;
GRANT ALL ON FUNCTION public.set_avc_id_on_insert() TO authenticated;
GRANT ALL ON FUNCTION public.set_avc_id_on_insert() TO service_role;


--
-- Name: FUNCTION set_has_business_card_true(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.set_has_business_card_true() TO anon;
GRANT ALL ON FUNCTION public.set_has_business_card_true() TO authenticated;
GRANT ALL ON FUNCTION public.set_has_business_card_true() TO service_role;


--
-- Name: FUNCTION spend_points_with_category(p_user_id uuid, p_amount integer, p_category_name text, p_reason text, p_metadata jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.spend_points_with_category(p_user_id uuid, p_amount integer, p_category_name text, p_reason text, p_metadata jsonb) TO anon;
GRANT ALL ON FUNCTION public.spend_points_with_category(p_user_id uuid, p_amount integer, p_category_name text, p_reason text, p_metadata jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.spend_points_with_category(p_user_id uuid, p_amount integer, p_category_name text, p_reason text, p_metadata jsonb) TO service_role;


--
-- Name: FUNCTION trigger_award_daily_login_points_fn(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_award_daily_login_points_fn() TO anon;
GRANT ALL ON FUNCTION public.trigger_award_daily_login_points_fn() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_award_daily_login_points_fn() TO service_role;


--
-- Name: FUNCTION update_cart_quantity(user_uuid uuid, product_uuid uuid, new_quantity integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_cart_quantity(user_uuid uuid, product_uuid uuid, new_quantity integer) TO anon;
GRANT ALL ON FUNCTION public.update_cart_quantity(user_uuid uuid, product_uuid uuid, new_quantity integer) TO authenticated;
GRANT ALL ON FUNCTION public.update_cart_quantity(user_uuid uuid, product_uuid uuid, new_quantity integer) TO service_role;


--
-- Name: FUNCTION update_category_counts(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_category_counts() TO anon;
GRANT ALL ON FUNCTION public.update_category_counts() TO authenticated;
GRANT ALL ON FUNCTION public.update_category_counts() TO service_role;


--
-- Name: FUNCTION update_discussion_counters(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_discussion_counters() TO anon;
GRANT ALL ON FUNCTION public.update_discussion_counters() TO authenticated;
GRANT ALL ON FUNCTION public.update_discussion_counters() TO service_role;


--
-- Name: FUNCTION update_notifications_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_notifications_updated_at() TO anon;
GRANT ALL ON FUNCTION public.update_notifications_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.update_notifications_updated_at() TO service_role;


--
-- Name: FUNCTION update_points_from_transaction(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.update_points_from_transaction() TO postgres;
GRANT ALL ON FUNCTION public.update_points_from_transaction() TO anon;
GRANT ALL ON FUNCTION public.update_points_from_transaction() TO authenticated;
GRANT ALL ON FUNCTION public.update_points_from_transaction() TO service_role;


--
-- Name: FUNCTION update_poll_vote_counts(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_poll_vote_counts() TO anon;
GRANT ALL ON FUNCTION public.update_poll_vote_counts() TO authenticated;
GRANT ALL ON FUNCTION public.update_poll_vote_counts() TO service_role;


--
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;


--
-- Name: FUNCTION update_vote_scores(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_vote_scores() TO anon;
GRANT ALL ON FUNCTION public.update_vote_scores() TO authenticated;
GRANT ALL ON FUNCTION public.update_vote_scores() TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION http_request(); Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

REVOKE ALL ON FUNCTION supabase_functions.http_request() FROM PUBLIC;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO anon;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO authenticated;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO service_role;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO postgres;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.schema_migrations TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.schema_migrations TO postgres;
GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE job; Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT SELECT ON TABLE cron.job TO postgres WITH GRANT OPTION;


--
-- Name: TABLE job_run_details; Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON TABLE cron.job_run_details TO postgres WITH GRANT OPTION;


--
-- Name: TABLE hypopg_list_indexes; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.hypopg_list_indexes TO postgres WITH GRANT OPTION;


--
-- Name: TABLE hypopg_hidden_indexes; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.hypopg_hidden_indexes TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;


--
-- Name: TABLE addresses; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.addresses TO anon;
GRANT ALL ON TABLE public.addresses TO authenticated;
GRANT ALL ON TABLE public.addresses TO service_role;


--
-- Name: TABLE advertisements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.advertisements TO anon;
GRANT ALL ON TABLE public.advertisements TO authenticated;
GRANT ALL ON TABLE public.advertisements TO service_role;


--
-- Name: TABLE contact_responses; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.contact_responses TO postgres;
GRANT ALL ON TABLE public.contact_responses TO anon;
GRANT ALL ON TABLE public.contact_responses TO authenticated;
GRANT ALL ON TABLE public.contact_responses TO service_role;


--
-- Name: TABLE landing_emails; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.landing_emails TO postgres;
GRANT ALL ON TABLE public.landing_emails TO anon;
GRANT ALL ON TABLE public.landing_emails TO authenticated;
GRANT ALL ON TABLE public.landing_emails TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- Name: TABLE all_emails; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.all_emails TO postgres;
GRANT ALL ON TABLE public.all_emails TO anon;
GRANT ALL ON TABLE public.all_emails TO authenticated;
GRANT ALL ON TABLE public.all_emails TO service_role;


--
-- Name: TABLE brands; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.brands TO anon;
GRANT ALL ON TABLE public.brands TO authenticated;
GRANT ALL ON TABLE public.brands TO service_role;


--
-- Name: TABLE cart; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.cart TO anon;
GRANT ALL ON TABLE public.cart TO authenticated;
GRANT ALL ON TABLE public.cart TO service_role;


--
-- Name: TABLE cart_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.cart_items TO anon;
GRANT ALL ON TABLE public.cart_items TO authenticated;
GRANT ALL ON TABLE public.cart_items TO service_role;


--
-- Name: TABLE products; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.products TO anon;
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;


--
-- Name: TABLE cart_with_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.cart_with_items TO anon;
GRANT ALL ON TABLE public.cart_with_items TO authenticated;
GRANT ALL ON TABLE public.cart_with_items TO service_role;


--
-- Name: TABLE certifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.certifications TO anon;
GRANT ALL ON TABLE public.certifications TO authenticated;
GRANT ALL ON TABLE public.certifications TO service_role;


--
-- Name: TABLE discussion_attachments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.discussion_attachments TO anon;
GRANT ALL ON TABLE public.discussion_attachments TO authenticated;
GRANT ALL ON TABLE public.discussion_attachments TO service_role;


--
-- Name: TABLE discussion_bookmarks; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.discussion_bookmarks TO anon;
GRANT ALL ON TABLE public.discussion_bookmarks TO authenticated;
GRANT ALL ON TABLE public.discussion_bookmarks TO service_role;


--
-- Name: TABLE discussion_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.discussion_categories TO anon;
GRANT ALL ON TABLE public.discussion_categories TO authenticated;
GRANT ALL ON TABLE public.discussion_categories TO service_role;


--
-- Name: TABLE discussion_comments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.discussion_comments TO anon;
GRANT ALL ON TABLE public.discussion_comments TO authenticated;
GRANT ALL ON TABLE public.discussion_comments TO service_role;


--
-- Name: TABLE discussion_poll_options; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.discussion_poll_options TO anon;
GRANT ALL ON TABLE public.discussion_poll_options TO authenticated;
GRANT ALL ON TABLE public.discussion_poll_options TO service_role;


--
-- Name: TABLE discussion_poll_votes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.discussion_poll_votes TO anon;
GRANT ALL ON TABLE public.discussion_poll_votes TO authenticated;
GRANT ALL ON TABLE public.discussion_poll_votes TO service_role;


--
-- Name: TABLE discussion_polls; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.discussion_polls TO anon;
GRANT ALL ON TABLE public.discussion_polls TO authenticated;
GRANT ALL ON TABLE public.discussion_polls TO service_role;


--
-- Name: TABLE discussion_reports; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.discussion_reports TO anon;
GRANT ALL ON TABLE public.discussion_reports TO authenticated;
GRANT ALL ON TABLE public.discussion_reports TO service_role;


--
-- Name: TABLE discussion_shares; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.discussion_shares TO anon;
GRANT ALL ON TABLE public.discussion_shares TO authenticated;
GRANT ALL ON TABLE public.discussion_shares TO service_role;


--
-- Name: TABLE discussion_views; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.discussion_views TO anon;
GRANT ALL ON TABLE public.discussion_views TO authenticated;
GRANT ALL ON TABLE public.discussion_views TO service_role;


--
-- Name: TABLE discussion_votes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.discussion_votes TO anon;
GRANT ALL ON TABLE public.discussion_votes TO authenticated;
GRANT ALL ON TABLE public.discussion_votes TO service_role;


--
-- Name: TABLE discussions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.discussions TO anon;
GRANT ALL ON TABLE public.discussions TO authenticated;
GRANT ALL ON TABLE public.discussions TO service_role;


--
-- Name: TABLE education; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.education TO anon;
GRANT ALL ON TABLE public.education TO authenticated;
GRANT ALL ON TABLE public.education TO service_role;


--
-- Name: TABLE employment; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.employment TO anon;
GRANT ALL ON TABLE public.employment TO authenticated;
GRANT ALL ON TABLE public.employment TO service_role;


--
-- Name: TABLE event_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.event_logs TO anon;
GRANT ALL ON TABLE public.event_logs TO authenticated;
GRANT ALL ON TABLE public.event_logs TO service_role;


--
-- Name: TABLE events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.events TO anon;
GRANT ALL ON TABLE public.events TO authenticated;
GRANT ALL ON TABLE public.events TO service_role;


--
-- Name: TABLE job_applications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.job_applications TO anon;
GRANT ALL ON TABLE public.job_applications TO authenticated;
GRANT ALL ON TABLE public.job_applications TO service_role;


--
-- Name: TABLE job_approval_queue; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.job_approval_queue TO postgres;
GRANT ALL ON TABLE public.job_approval_queue TO anon;
GRANT ALL ON TABLE public.job_approval_queue TO authenticated;
GRANT ALL ON TABLE public.job_approval_queue TO service_role;


--
-- Name: TABLE jobs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.jobs TO anon;
GRANT ALL ON TABLE public.jobs TO authenticated;
GRANT ALL ON TABLE public.jobs TO service_role;


--
-- Name: TABLE notification_delivery_log; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.notification_delivery_log TO anon;
GRANT ALL ON TABLE public.notification_delivery_log TO authenticated;
GRANT ALL ON TABLE public.notification_delivery_log TO service_role;


--
-- Name: TABLE notification_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.notification_settings TO anon;
GRANT ALL ON TABLE public.notification_settings TO authenticated;
GRANT ALL ON TABLE public.notification_settings TO service_role;


--
-- Name: TABLE notification_templates; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.notification_templates TO anon;
GRANT ALL ON TABLE public.notification_templates TO authenticated;
GRANT ALL ON TABLE public.notification_templates TO service_role;


--
-- Name: TABLE notifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.notifications TO anon;
GRANT ALL ON TABLE public.notifications TO authenticated;
GRANT ALL ON TABLE public.notifications TO service_role;


--
-- Name: TABLE order_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.order_items TO anon;
GRANT ALL ON TABLE public.order_items TO authenticated;
GRANT ALL ON TABLE public.order_items TO service_role;


--
-- Name: SEQUENCE order_number_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.order_number_seq TO anon;
GRANT ALL ON SEQUENCE public.order_number_seq TO authenticated;
GRANT ALL ON SEQUENCE public.order_number_seq TO service_role;


--
-- Name: TABLE order_summary; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.order_summary TO anon;
GRANT ALL ON TABLE public.order_summary TO authenticated;
GRANT ALL ON TABLE public.order_summary TO service_role;


--
-- Name: TABLE orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.orders TO anon;
GRANT ALL ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;


--
-- Name: TABLE points; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.points TO anon;
GRANT ALL ON TABLE public.points TO authenticated;
GRANT ALL ON TABLE public.points TO service_role;


--
-- Name: TABLE points_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.points_categories TO anon;
GRANT ALL ON TABLE public.points_categories TO authenticated;
GRANT ALL ON TABLE public.points_categories TO service_role;


--
-- Name: TABLE product_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_categories TO anon;
GRANT ALL ON TABLE public.product_categories TO authenticated;
GRANT ALL ON TABLE public.product_categories TO service_role;


--
-- Name: TABLE profile_completion; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profile_completion TO anon;
GRANT ALL ON TABLE public.profile_completion TO authenticated;
GRANT ALL ON TABLE public.profile_completion TO service_role;


--
-- Name: TABLE social_links; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.social_links TO anon;
GRANT ALL ON TABLE public.social_links TO authenticated;
GRANT ALL ON TABLE public.social_links TO service_role;


--
-- Name: TABLE public_profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.public_profiles TO anon;
GRANT ALL ON TABLE public.public_profiles TO authenticated;
GRANT ALL ON TABLE public.public_profiles TO service_role;


--
-- Name: TABLE transactions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.transactions TO anon;
GRANT ALL ON TABLE public.transactions TO authenticated;
GRANT ALL ON TABLE public.transactions TO service_role;


--
-- Name: TABLE real_transactions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.real_transactions TO anon;
GRANT ALL ON TABLE public.real_transactions TO authenticated;
GRANT ALL ON TABLE public.real_transactions TO service_role;


--
-- Name: TABLE review_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.review_categories TO anon;
GRANT ALL ON TABLE public.review_categories TO authenticated;
GRANT ALL ON TABLE public.review_categories TO service_role;


--
-- Name: TABLE review_comments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.review_comments TO anon;
GRANT ALL ON TABLE public.review_comments TO authenticated;
GRANT ALL ON TABLE public.review_comments TO service_role;


--
-- Name: TABLE review_products; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.review_products TO anon;
GRANT ALL ON TABLE public.review_products TO authenticated;
GRANT ALL ON TABLE public.review_products TO service_role;


--
-- Name: TABLE review_requests; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.review_requests TO anon;
GRANT ALL ON TABLE public.review_requests TO authenticated;
GRANT ALL ON TABLE public.review_requests TO service_role;


--
-- Name: TABLE reviews; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.reviews TO anon;
GRANT ALL ON TABLE public.reviews TO authenticated;
GRANT ALL ON TABLE public.reviews TO service_role;


--
-- Name: TABLE reward_purchases; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.reward_purchases TO anon;
GRANT ALL ON TABLE public.reward_purchases TO authenticated;
GRANT ALL ON TABLE public.reward_purchases TO service_role;


--
-- Name: TABLE rewards; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.rewards TO anon;
GRANT ALL ON TABLE public.rewards TO authenticated;
GRANT ALL ON TABLE public.rewards TO service_role;


--
-- Name: TABLE reward_purchase_details; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.reward_purchase_details TO postgres;
GRANT ALL ON TABLE public.reward_purchase_details TO anon;
GRANT ALL ON TABLE public.reward_purchase_details TO authenticated;
GRANT ALL ON TABLE public.reward_purchase_details TO service_role;


--
-- Name: TABLE seller_order_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.seller_order_items TO anon;
GRANT ALL ON TABLE public.seller_order_items TO authenticated;
GRANT ALL ON TABLE public.seller_order_items TO service_role;


--
-- Name: TABLE seller_profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.seller_profiles TO anon;
GRANT ALL ON TABLE public.seller_profiles TO authenticated;
GRANT ALL ON TABLE public.seller_profiles TO service_role;


--
-- Name: TABLE tool_purchases; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tool_purchases TO anon;
GRANT ALL ON TABLE public.tool_purchases TO authenticated;
GRANT ALL ON TABLE public.tool_purchases TO service_role;


--
-- Name: TABLE training_enrollments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.training_enrollments TO anon;
GRANT ALL ON TABLE public.training_enrollments TO authenticated;
GRANT ALL ON TABLE public.training_enrollments TO service_role;


--
-- Name: TABLE training_programs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.training_programs TO anon;
GRANT ALL ON TABLE public.training_programs TO authenticated;
GRANT ALL ON TABLE public.training_programs TO service_role;


--
-- Name: TABLE user_notification_preferences; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_notification_preferences TO anon;
GRANT ALL ON TABLE public.user_notification_preferences TO authenticated;
GRANT ALL ON TABLE public.user_notification_preferences TO service_role;


--
-- Name: TABLE user_points_by_category; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_points_by_category TO anon;
GRANT ALL ON TABLE public.user_points_by_category TO authenticated;
GRANT ALL ON TABLE public.user_points_by_category TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE messages_2025_06_13; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_06_13 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_06_13 TO dashboard_user;


--
-- Name: TABLE messages_2025_06_14; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_06_14 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_06_14 TO dashboard_user;


--
-- Name: TABLE messages_2025_06_15; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_06_15 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_06_15 TO dashboard_user;


--
-- Name: TABLE messages_2025_06_16; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_06_16 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_06_16 TO dashboard_user;


--
-- Name: TABLE messages_2025_06_17; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_06_17 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_06_17 TO dashboard_user;


--
-- Name: TABLE messages_2025_06_18; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_06_18 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_06_18 TO dashboard_user;


--
-- Name: TABLE messages_2025_06_19; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_06_19 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_06_19 TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres;


--
-- Name: TABLE migrations; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.migrations TO anon;
GRANT ALL ON TABLE storage.migrations TO authenticated;
GRANT ALL ON TABLE storage.migrations TO service_role;
GRANT ALL ON TABLE storage.migrations TO postgres;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres;


--
-- Name: TABLE prefixes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.prefixes TO service_role;
GRANT ALL ON TABLE storage.prefixes TO authenticated;
GRANT ALL ON TABLE storage.prefixes TO anon;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE hooks; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON TABLE supabase_functions.hooks TO anon;
GRANT ALL ON TABLE supabase_functions.hooks TO authenticated;
GRANT ALL ON TABLE supabase_functions.hooks TO service_role;


--
-- Name: SEQUENCE hooks_id_seq; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO anon;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO authenticated;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO service_role;


--
-- Name: TABLE migrations; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON TABLE supabase_functions.migrations TO anon;
GRANT ALL ON TABLE supabase_functions.migrations TO authenticated;
GRANT ALL ON TABLE supabase_functions.migrations TO service_role;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,DELETE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: cron; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA cron GRANT ALL ON SEQUENCES  TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: cron; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA cron GRANT ALL ON FUNCTIONS  TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: cron; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA cron GRANT ALL ON TABLES  TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES  TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS  TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES  TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: supabase_functions; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: supabase_functions; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: supabase_functions; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA supabase_functions GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA supabase_functions GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA supabase_functions GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA supabase_functions GRANT ALL ON TABLES  TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO postgres;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

