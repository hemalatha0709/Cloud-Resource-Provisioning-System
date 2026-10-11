--
-- PostgreSQL database dump
--

\restrict nLWkMuA2jz6Wg8bP2Dd2wbiHOFgfJRSFmhtZB7xjcMU8Sqjggy1u2AikOwyuS0A

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

-- Started on 2026-10-04 09:36:32

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 256 (class 1255 OID 16872)
-- Name: notify_admin_new_request(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_admin_new_request() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_requester_name TEXT;
    v_resource_type_name TEXT;
    v_provider_name TEXT;
BEGIN

    -- Get the user who submitted the request
    SELECT COALESCE(u.full_name, u.username)
    INTO v_requester_name
    FROM users u
    WHERE u.user_id = NEW.user_id;

    -- Get resource type
    SELECT rt.type_name
    INTO v_resource_type_name
    FROM resource_types rt
    WHERE rt.type_id = NEW.type_id;

    -- Get cloud provider
    SELECT cp.provider_name
    INTO v_provider_name
    FROM cloud_providers cp
    WHERE cp.provider_id = NEW.provider_id;

    -- Create notification for every active administrator
    INSERT INTO notifications (
        user_id,
        title,
        message,
        type
    )
    SELECT
        u.user_id,
        'New Resource Request',
        'Requested by: ' || COALESCE(v_requester_name, 'Unknown User') ||
        E'\nResource: ' || COALESCE(NEW.resource_name, 'Not specified') ||
        E'\nType: ' || COALESCE(v_resource_type_name, 'Not specified') ||
        E'\nProvider: ' || COALESCE(v_provider_name, 'Not specified') ||
        E'\nCPU: ' || COALESCE(NEW.cpu_cores::TEXT, 'N/A') || ' Cores' ||
        E'\nMemory: ' || COALESCE(NEW.memory_gb::TEXT, 'N/A') || ' GB' ||
        E'\nStorage: ' || COALESCE(NEW.storage_gb::TEXT, 'N/A') || ' GB' ||
        E'\nRequested at: ' ||
            TO_CHAR(
                NEW.requested_at,
                'DD Mon YYYY, HH12:MI AM'
            ) ||
        E'\nJustification: ' ||
            COALESCE(NEW.justification, 'Not provided'),
        'REQUEST'
    FROM users u
    WHERE u.role_id = 1
      AND u.status = 'ACTIVE';

    RETURN NEW;

END;
$$;


ALTER FUNCTION public.notify_admin_new_request() OWNER TO postgres;

--
-- TOC entry 244 (class 1255 OID 16876)
-- Name: notify_user_request_status(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_user_request_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_resource_type_name TEXT;
    v_provider_name TEXT;
    v_title TEXT;
    v_message TEXT;
    v_type TEXT;
BEGIN

    -- Only create notification when the request status actually changes
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Get resource type
    SELECT rt.type_name
    INTO v_resource_type_name
    FROM resource_types rt
    WHERE rt.type_id = NEW.type_id;

    -- Get provider name
    SELECT cp.provider_name
    INTO v_provider_name
    FROM cloud_providers cp
    WHERE cp.provider_id = NEW.provider_id;

    -- APPROVED
    IF NEW.status = 'APPROVED' THEN

        v_title := 'Request Approved';
        v_type := 'SUCCESS';

        v_message :=
            'Your resource request has been approved.' ||
            E'\nResource: ' ||
            COALESCE(NEW.resource_name, 'Not specified') ||
            E'\nType: ' ||
            COALESCE(v_resource_type_name, 'Not specified') ||
            E'\nProvider: ' ||
            COALESCE(v_provider_name, 'Not specified') ||
            E'\nCPU: ' ||
            COALESCE(NEW.cpu_cores::TEXT, 'N/A') ||
            ' Cores' ||
            E'\nMemory: ' ||
            COALESCE(NEW.memory_gb::TEXT, 'N/A') ||
            ' GB' ||
            E'\nStorage: ' ||
            COALESCE(NEW.storage_gb::TEXT, 'N/A') ||
            ' GB';

    -- REJECTED
    ELSIF NEW.status = 'REJECTED' THEN

        v_title := 'Request Rejected';
        v_type := 'ERROR';

        v_message :=
            'Your resource request has been rejected.' ||
            E'\nResource: ' ||
            COALESCE(NEW.resource_name, 'Not specified') ||
            E'\nType: ' ||
            COALESCE(v_resource_type_name, 'Not specified') ||
            E'\nProvider: ' ||
            COALESCE(v_provider_name, 'Not specified') ||
            E'\nCPU: ' ||
            COALESCE(NEW.cpu_cores::TEXT, 'N/A') ||
            ' Cores' ||
            E'\nMemory: ' ||
            COALESCE(NEW.memory_gb::TEXT, 'N/A') ||
            ' GB' ||
            E'\nStorage: ' ||
            COALESCE(NEW.storage_gb::TEXT, 'N/A') ||
            ' GB';

    ELSE
        RETURN NEW;
    END IF;

    -- Send notification to the user who submitted the request
    INSERT INTO notifications (
        user_id,
        title,
        message,
        type
    )
    VALUES (
        NEW.user_id,
        v_title,
        v_message,
        v_type
    );

    RETURN NEW;

END;
$$;


ALTER FUNCTION public.notify_user_request_status() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 239 (class 1259 OID 16821)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    log_id integer NOT NULL,
    user_id integer,
    action character varying(120),
    entity_name character varying(100),
    entity_id integer,
    details text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16820)
-- Name: audit_logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_log_id_seq OWNER TO postgres;

--
-- TOC entry 5080 (class 0 OID 0)
-- Dependencies: 238
-- Name: audit_logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_log_id_seq OWNED BY public.audit_logs.log_id;


--
-- TOC entry 225 (class 1259 OID 16705)
-- Name: cloud_providers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cloud_providers (
    provider_id integer NOT NULL,
    provider_name character varying(50) NOT NULL,
    region character varying(100),
    description text
);


ALTER TABLE public.cloud_providers OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16704)
-- Name: cloud_providers_provider_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cloud_providers_provider_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cloud_providers_provider_id_seq OWNER TO postgres;

--
-- TOC entry 5081 (class 0 OID 0)
-- Dependencies: 224
-- Name: cloud_providers_provider_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cloud_providers_provider_id_seq OWNED BY public.cloud_providers.provider_id;


--
-- TOC entry 237 (class 1259 OID 16808)
-- Name: login_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_history (
    login_id integer NOT NULL,
    user_id integer,
    login_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    logout_time timestamp without time zone,
    ip_address character varying(45)
);


ALTER TABLE public.login_history OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16807)
-- Name: login_history_login_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.login_history_login_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.login_history_login_id_seq OWNER TO postgres;

--
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 236
-- Name: login_history_login_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.login_history_login_id_seq OWNED BY public.login_history.login_id;


--
-- TOC entry 241 (class 1259 OID 16836)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    notification_id integer NOT NULL,
    user_id integer,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    title character varying(255) DEFAULT 'Notification'::character varying,
    type character varying(50) DEFAULT 'INFO'::character varying
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16835)
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_notification_id_seq OWNER TO postgres;

--
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 240
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- TOC entry 220 (class 1259 OID 16659)
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    permission_id integer NOT NULL,
    permission_name character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16658)
-- Name: permissions_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_permission_id_seq OWNER TO postgres;

--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 219
-- Name: permissions_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_permission_id_seq OWNED BY public.permissions.permission_id;


--
-- TOC entry 243 (class 1259 OID 16852)
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    report_id integer NOT NULL,
    report_name character varying(150),
    report_type character varying(50),
    generated_by integer,
    generated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16851)
-- Name: reports_report_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reports_report_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reports_report_id_seq OWNER TO postgres;

--
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 242
-- Name: reports_report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reports_report_id_seq OWNED BY public.reports.report_id;


--
-- TOC entry 235 (class 1259 OID 16795)
-- Name: resource_cost; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_cost (
    cost_id integer NOT NULL,
    resource_id integer,
    monthly_cost numeric(10,2),
    billing_date date,
    currency character varying(10) DEFAULT 'INR'::character varying
);


ALTER TABLE public.resource_cost OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16794)
-- Name: resource_cost_cost_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resource_cost_cost_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resource_cost_cost_id_seq OWNER TO postgres;

--
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 234
-- Name: resource_cost_cost_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resource_cost_cost_id_seq OWNED BY public.resource_cost.cost_id;


--
-- TOC entry 229 (class 1259 OID 16727)
-- Name: resource_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_requests (
    request_id integer NOT NULL,
    user_id integer NOT NULL,
    type_id integer NOT NULL,
    provider_id integer,
    resource_name character varying(120) NOT NULL,
    cpu_cores integer,
    memory_gb integer,
    storage_gb integer,
    justification text,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    requested_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reviewed_by integer,
    reviewed_at timestamp without time zone,
    CONSTRAINT resource_requests_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying])::text[])))
);


ALTER TABLE public.resource_requests OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16726)
-- Name: resource_requests_request_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resource_requests_request_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resource_requests_request_id_seq OWNER TO postgres;

--
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 228
-- Name: resource_requests_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resource_requests_request_id_seq OWNED BY public.resource_requests.request_id;


--
-- TOC entry 227 (class 1259 OID 16716)
-- Name: resource_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_types (
    type_id integer NOT NULL,
    type_name character varying(50) NOT NULL,
    description text
);


ALTER TABLE public.resource_types OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16715)
-- Name: resource_types_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resource_types_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resource_types_type_id_seq OWNER TO postgres;

--
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 226
-- Name: resource_types_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resource_types_type_id_seq OWNED BY public.resource_types.type_id;


--
-- TOC entry 231 (class 1259 OID 16759)
-- Name: resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resources (
    resource_id integer NOT NULL,
    request_id integer,
    provider_id integer,
    cloud_identifier character varying(120),
    resource_status character varying(30) DEFAULT 'ACTIVE'::character varying,
    allocation_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expiry_date timestamp without time zone
);


ALTER TABLE public.resources OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16758)
-- Name: resources_resource_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resources_resource_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resources_resource_id_seq OWNER TO postgres;

--
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 230
-- Name: resources_resource_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resources_resource_id_seq OWNED BY public.resources.resource_id;


--
-- TOC entry 221 (class 1259 OID 16669)
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16648)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    role_id integer NOT NULL,
    role_name character varying(50) NOT NULL,
    description text
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16647)
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_role_id_seq OWNER TO postgres;

--
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 217
-- Name: roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;


--
-- TOC entry 233 (class 1259 OID 16782)
-- Name: usage_monitoring; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usage_monitoring (
    monitoring_id integer NOT NULL,
    resource_id integer,
    cpu_percent numeric(5,2),
    memory_percent numeric(5,2),
    storage_percent numeric(5,2),
    network_usage numeric(10,2),
    health_status character varying(30),
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usage_monitoring OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16781)
-- Name: usage_monitoring_monitoring_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usage_monitoring_monitoring_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usage_monitoring_monitoring_id_seq OWNER TO postgres;

--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 232
-- Name: usage_monitoring_monitoring_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usage_monitoring_monitoring_id_seq OWNED BY public.usage_monitoring.monitoring_id;


--
-- TOC entry 223 (class 1259 OID 16685)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(100) NOT NULL,
    full_name character varying(150),
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role_id integer,
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16684)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 4827 (class 2604 OID 16824)
-- Name: audit_logs log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN log_id SET DEFAULT nextval('public.audit_logs_log_id_seq'::regclass);


--
-- TOC entry 4813 (class 2604 OID 16708)
-- Name: cloud_providers provider_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cloud_providers ALTER COLUMN provider_id SET DEFAULT nextval('public.cloud_providers_provider_id_seq'::regclass);


--
-- TOC entry 4825 (class 2604 OID 16811)
-- Name: login_history login_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_history ALTER COLUMN login_id SET DEFAULT nextval('public.login_history_login_id_seq'::regclass);


--
-- TOC entry 4829 (class 2604 OID 16839)
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- TOC entry 4809 (class 2604 OID 16662)
-- Name: permissions permission_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN permission_id SET DEFAULT nextval('public.permissions_permission_id_seq'::regclass);


--
-- TOC entry 4834 (class 2604 OID 16855)
-- Name: reports report_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports ALTER COLUMN report_id SET DEFAULT nextval('public.reports_report_id_seq'::regclass);


--
-- TOC entry 4823 (class 2604 OID 16798)
-- Name: resource_cost cost_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_cost ALTER COLUMN cost_id SET DEFAULT nextval('public.resource_cost_cost_id_seq'::regclass);


--
-- TOC entry 4815 (class 2604 OID 16730)
-- Name: resource_requests request_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_requests ALTER COLUMN request_id SET DEFAULT nextval('public.resource_requests_request_id_seq'::regclass);


--
-- TOC entry 4814 (class 2604 OID 16719)
-- Name: resource_types type_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_types ALTER COLUMN type_id SET DEFAULT nextval('public.resource_types_type_id_seq'::regclass);


--
-- TOC entry 4818 (class 2604 OID 16762)
-- Name: resources resource_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources ALTER COLUMN resource_id SET DEFAULT nextval('public.resources_resource_id_seq'::regclass);


--
-- TOC entry 4808 (class 2604 OID 16651)
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);


--
-- TOC entry 4821 (class 2604 OID 16785)
-- Name: usage_monitoring monitoring_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usage_monitoring ALTER COLUMN monitoring_id SET DEFAULT nextval('public.usage_monitoring_monitoring_id_seq'::regclass);


--
-- TOC entry 4810 (class 2604 OID 16688)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 5070 (class 0 OID 16821)
-- Dependencies: 239
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (log_id, user_id, action, entity_name, entity_id, details, created_at) FROM stdin;
1	1	APPROVED	resource_requests	1	Admin approved VM request	2026-08-05 19:12:59.998077
2	1	CREATED	resources	1	AWS EC2 instance created	2026-08-05 19:12:59.998077
3	1	APPROVED	resource_requests	1	Admin approved VM request	2026-08-05 19:18:30.124636
4	1	CREATED	resources	1	AWS EC2 instance created	2026-08-05 19:18:30.124636
\.


--
-- TOC entry 5056 (class 0 OID 16705)
-- Dependencies: 225
-- Data for Name: cloud_providers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cloud_providers (provider_id, provider_name, region, description) FROM stdin;
1	AWS	Asia Pacific Mumbai	Amazon Web Services
2	Microsoft Azure	Central India	Azure Cloud
3	Google Cloud	Mumbai Region	Google Cloud Platform
\.


--
-- TOC entry 5068 (class 0 OID 16808)
-- Dependencies: 237
-- Data for Name: login_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.login_history (login_id, user_id, login_time, logout_time, ip_address) FROM stdin;
1	1	2026-08-05 19:11:49.795161	\N	192.168.1.10
2	2	2026-08-05 19:11:49.795161	\N	192.168.1.20
\.


--
-- TOC entry 5072 (class 0 OID 16836)
-- Dependencies: 241
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (notification_id, user_id, message, is_read, created_at, title, type) FROM stdin;
1	2	Your VM request has been approved	f	2026-08-05 19:12:25.475578	Notification	INFO
2	2	Your database request is waiting for approval	f	2026-08-05 19:12:25.475578	Notification	INFO
3	1	A new resource request has been submitted and is waiting for your review.	t	2026-09-10 16:58:10.047833	New Resource Request	REQUEST
4	1	Requested by: Johitha Sri\nResource: Project Storage\nType: DATABASE\nProvider: Microsoft Azure\nCPU: 33 Cores\nMemory: 45 GB\nStorage: 59 GB\nRequested at: 10 Sep 2026, 05:12 PM\nJustification: data storage	t	2026-09-10 17:12:18.630935	New Resource Request	REQUEST
6	1	Requested by: Hemalatha\nResource: Security Spoof Test\nType: VM\nProvider: AWS\nCPU: 2 Cores\nMemory: 4 GB\nStorage: 50 GB\nRequested at: 16 Sep 2026, 01:07 PM\nJustification: Testing user ID spoofing	f	2026-09-16 13:07:42.469506	New Resource Request	REQUEST
7	2	Your resource request has been approved.\nResource: Security Test VM\nType: VM\nProvider: AWS\nCPU: 2 Cores\nMemory: 4 GB\nStorage: 50 GB	f	2026-09-16 13:25:31.151198	Request Approved	SUCCESS
8	1	Requested by: Hemalatha\nResource: Functional Test VM\nType: VM\nProvider: AWS\nCPU: 2 Cores\nMemory: 4 GB\nStorage: 50 GB\nRequested at: 16 Sep 2026, 02:07 PM\nJustification: Testing the complete cloud resource provisioning workflow	f	2026-09-16 14:07:44.154818	New Resource Request	REQUEST
9	2	Your resource request has been approved.\nResource: Functional Test VM\nType: VM\nProvider: AWS\nCPU: 2 Cores\nMemory: 4 GB\nStorage: 50 GB	f	2026-09-16 14:26:25.906083	Request Approved	SUCCESS
10	3	Your resource request has been rejected.\nResource: Project Storage\nType: DATABASE\nProvider: Microsoft Azure\nCPU: 33 Cores\nMemory: 45 GB\nStorage: 59 GB	f	2026-09-17 11:39:49.562404	Request Rejected	ERROR
11	3	Your resource request has been approved.\nResource: production web server\nType: FUNCTION\nProvider: Microsoft Azure\nCPU: 31 Cores\nMemory: 9 GB\nStorage: 49 GB	f	2026-09-18 11:05:58.989522	Request Approved	SUCCESS
12	1	Requested by: Hemalatha\nResource: Functional Test VM\nType: STORAGE\nProvider: Microsoft Azure\nCPU: 3 Cores\nMemory: 6 GB\nStorage: 55 GB\nRequested at: 18 Sep 2026, 11:41 AM\nJustification: End-to-end testing of cloud resource provisioning workflow	f	2026-09-18 11:41:44.394453	New Resource Request	REQUEST
13	2	Your resource request has been approved.\nResource: Functional Test VM\nType: STORAGE\nProvider: Microsoft Azure\nCPU: 3 Cores\nMemory: 6 GB\nStorage: 55 GB	f	2026-09-18 11:45:17.262966	Request Approved	SUCCESS
14	1	Requested by: Hemalatha\nResource: Application Container\nType: VM\nProvider: Microsoft Azure\nCPU: 22 Cores\nMemory: 20 GB\nStorage: 35 GB\nRequested at: 19 Sep 2026, 11:26 AM\nJustification: Testing expiry date fix	f	2026-09-19 11:26:46.79789	New Resource Request	REQUEST
15	2	Your resource request has been approved.\nResource: Application Container\nType: VM\nProvider: Microsoft Azure\nCPU: 22 Cores\nMemory: 20 GB\nStorage: 35 GB	f	2026-09-19 11:28:15.012572	Request Approved	SUCCESS
16	1	Requested by: Hemalatha\nResource: Project Storage\nType: STORAGE\nProvider: Google Cloud\nCPU: 25 Cores\nMemory: 19 GB\nStorage: 49 GB\nRequested at: 19 Sep 2026, 11:39 AM\nJustification: the project storage is under construction	f	2026-09-19 11:39:24.820979	New Resource Request	REQUEST
17	2	Your resource request has been rejected.\nResource: Project Storage\nType: STORAGE\nProvider: Google Cloud\nCPU: 25 Cores\nMemory: 19 GB\nStorage: 49 GB	f	2026-09-19 11:40:37.943883	Request Rejected	ERROR
18	1	Requested by: Hemalatha\nResource: Automatic Allocation Test VM\nType: VM\nProvider: Microsoft Azure\nCPU: 38 Cores\nMemory: 28 GB\nStorage: 50 GB\nRequested at: 19 Sep 2026, 11:49 AM\nJustification: Final end-to-end testing of cloud resource provisioning	f	2026-09-19 11:49:38.445968	New Resource Request	REQUEST
19	2	Your resource request has been approved.\nResource: Automatic Allocation Test VM\nType: VM\nProvider: Microsoft Azure\nCPU: 38 Cores\nMemory: 28 GB\nStorage: 50 GB	f	2026-09-19 11:51:18.552769	Request Approved	SUCCESS
20	1	Requested by: Johitha Sri\nResource: Student Database Server\nType: DATABASE\nProvider: Microsoft Azure\nCPU: 25 Cores\nMemory: 37 GB\nStorage: 50 GB\nRequested at: 21 Sep 2026, 11:02 AM\nJustification: its helpful to store students data	f	2026-09-21 11:02:23.810631	New Resource Request	REQUEST
21	3	Your resource request has been approved.\nResource: Application Container\nType: CONTAINER\nProvider: Microsoft Azure\nCPU: 35 Cores\nMemory: 40 GB\nStorage: 68 GB	f	2026-09-21 11:03:32.527356	Request Approved	SUCCESS
5	1	Requested by: Hemalatha\nResource: Security Test VM\nType: VM\nProvider: AWS\nCPU: 2 Cores\nMemory: 4 GB\nStorage: 50 GB\nRequested at: 16 Sep 2026, 01:04 PM\nJustification: Testing request ownership security	t	2026-09-16 13:04:53.841719	New Resource Request	REQUEST
22	1	Requested by: Johitha Sri\nResource: Automatic Allocation Test VM\nType: VM\nProvider: Google Cloud\nCPU: 43 Cores\nMemory: 35 GB\nStorage: 55 GB\nRequested at: 22 Sep 2026, 12:28 PM\nJustification: allocation testing process	f	2026-09-22 12:28:01.142562	New Resource Request	REQUEST
23	3	Your resource request has been approved.\nResource: Student Database Server\nType: DATABASE\nProvider: Microsoft Azure\nCPU: 25 Cores\nMemory: 37 GB\nStorage: 50 GB	f	2026-09-22 12:32:02.099821	Request Approved	SUCCESS
24	1	Requested by: Hemalatha\nResource: Functional Test VM\nType: VM\nProvider: Google Cloud\nCPU: 31 Cores\nMemory: 44 GB\nStorage: 82 GB\nRequested at: 22 Sep 2026, 12:42 PM\nJustification: the functional testing of vm by google cloud	f	2026-09-22 12:42:11.251276	New Resource Request	REQUEST
25	3	Your resource request has been approved.\nResource: Automatic Allocation Test VM\nType: VM\nProvider: Google Cloud\nCPU: 43 Cores\nMemory: 35 GB\nStorage: 55 GB	f	2026-09-22 12:42:44.943986	Request Approved	SUCCESS
26	1	Requested by: Shrinika Senthil\nResource: my project vm\nType: DATABASE\nProvider: Microsoft Azure\nCPU: 57 Cores\nMemory: 29 GB\nStorage: 66 GB\nRequested at: 22 Sep 2026, 12:53 PM\nJustification: my project database is stored	f	2026-09-22 12:53:33.663877	New Resource Request	REQUEST
27	2	Your resource request has been approved.\nResource: Functional Test VM\nType: VM\nProvider: Google Cloud\nCPU: 31 Cores\nMemory: 44 GB\nStorage: 82 GB	f	2026-09-22 12:53:58.894879	Request Approved	SUCCESS
28	1	Requested by: Hemalatha\nResource: Functional Test VM\nType: VM\nProvider: AWS\nCPU: 24 Cores\nMemory: 33 GB\nStorage: 66 GB\nRequested at: 22 Sep 2026, 04:05 PM\nJustification: expiry date fix	f	2026-09-22 16:05:35.751465	New Resource Request	REQUEST
29	2	Your resource request has been approved.\nResource: Functional Test VM\nType: VM\nProvider: AWS\nCPU: 24 Cores\nMemory: 33 GB\nStorage: 66 GB	f	2026-09-22 16:06:40.436865	Request Approved	SUCCESS
30	1	Requested by: Hemalatha\nResource: Application Container\nType: CONTAINER\nProvider: AWS\nCPU: 32 Cores\nMemory: 40 GB\nStorage: 45 GB\nRequested at: 22 Sep 2026, 04:17 PM\nJustification: monitoring data fix	f	2026-09-22 16:17:41.573428	New Resource Request	REQUEST
31	2	Your resource request has been approved.\nResource: Application Container\nType: CONTAINER\nProvider: AWS\nCPU: 32 Cores\nMemory: 40 GB\nStorage: 45 GB	f	2026-09-22 16:18:29.890618	Request Approved	SUCCESS
32	1	Requested by: Hemalatha\nResource: My Cloud VM\nType: VM\nProvider: Microsoft Azure\nCPU: 13 Cores\nMemory: 26 GB\nStorage: 60 GB\nRequested at: 22 Sep 2026, 06:05 PM\nJustification: testing the monitoring data's	f	2026-09-22 18:05:41.249201	New Resource Request	REQUEST
33	2	Your resource request has been approved.\nResource: My Cloud VM\nType: VM\nProvider: Microsoft Azure\nCPU: 13 Cores\nMemory: 26 GB\nStorage: 60 GB	f	2026-09-22 18:06:33.950031	Request Approved	SUCCESS
34	1	Requested by: Shrinika Senthil\nResource: Functional Test VM\nType: CONTAINER\nProvider: Microsoft Azure\nCPU: 15 Cores\nMemory: 37 GB\nStorage: 50 GB\nRequested at: 22 Sep 2026, 06:18 PM\nJustification: just expiry data checking	f	2026-09-22 18:18:29.756353	New Resource Request	REQUEST
35	4	Your resource request has been approved.\nResource: my project vm\nType: DATABASE\nProvider: Microsoft Azure\nCPU: 57 Cores\nMemory: 29 GB\nStorage: 66 GB	f	2026-09-22 18:20:46.353908	Request Approved	SUCCESS
36	1	Requested by: Hemalatha\nResource: Functional Reject Test\nType: VM\nProvider: Microsoft Azure\nCPU: 2 Cores\nMemory: 4 GB\nStorage: 50 GB\nRequested at: 22 Sep 2026, 07:02 PM\nJustification: Testing the resource request rejection workflow	f	2026-09-22 19:02:03.950068	New Resource Request	REQUEST
37	2	Your resource request has been rejected.\nResource: Functional Reject Test\nType: VM\nProvider: Microsoft Azure\nCPU: 2 Cores\nMemory: 4 GB\nStorage: 50 GB	f	2026-09-22 19:13:48.071602	Request Rejected	ERROR
38	1	Requested by: Hemalatha\nResource: Student Database Server\nType: DATABASE\nProvider: AWS\nCPU: 30 Cores\nMemory: 23 GB\nStorage: 50 GB\nRequested at: 23 Sep 2026, 12:20 PM\nJustification: student database server final verification proof	f	2026-09-23 12:20:26.300162	New Resource Request	REQUEST
39	4	Your resource request has been approved.\nResource: Functional Test VM\nType: CONTAINER\nProvider: Microsoft Azure\nCPU: 15 Cores\nMemory: 37 GB\nStorage: 50 GB	f	2026-09-23 12:31:54.935218	Request Approved	SUCCESS
\.


--
-- TOC entry 5051 (class 0 OID 16659)
-- Dependencies: 220
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (permission_id, permission_name, description) FROM stdin;
1	CREATE_RESOURCE_REQUEST	\N
2	APPROVE_REQUEST	\N
3	DELETE_RESOURCE	\N
4	VIEW_REPORT	\N
5	VIEW_MONITORING	\N
\.


--
-- TOC entry 5074 (class 0 OID 16852)
-- Dependencies: 243
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (report_id, report_name, report_type, generated_by, generated_at) FROM stdin;
\.


--
-- TOC entry 5066 (class 0 OID 16795)
-- Dependencies: 235
-- Data for Name: resource_cost; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_cost (cost_id, resource_id, monthly_cost, billing_date, currency) FROM stdin;
1	1	3500.00	2026-08-01	INR
2	2	1200.00	2026-08-01	INR
\.


--
-- TOC entry 5060 (class 0 OID 16727)
-- Dependencies: 229
-- Data for Name: resource_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_requests (request_id, user_id, type_id, provider_id, resource_name, cpu_cores, memory_gb, storage_gb, justification, status, requested_at, reviewed_by, reviewed_at) FROM stdin;
37	2	1	1	Functional Test VM	24	33	66	expiry date fix	APPROVED	2026-09-22 16:05:35.751465	1	2026-09-22 16:06:40.436865
5	3	1	1	My Cloud VM	4	8	100	Need VM for final year project development	APPROVED	2026-08-06 13:50:19.941294	1	2026-08-09 15:31:04.272029
3	2	3	2	Student Database Server	4	16	200	Need database for application testing	REJECTED	2026-08-05 19:08:20.913438	1	2026-08-10 10:32:38.50505
7	3	1	1	Automatic Allocation Test VM	2	4	50	Testing automatic resource allocation after admin approval	APPROVED	2026-08-12 12:52:45.62596	1	2026-08-12 13:05:42.821196
2	2	2	1	Project Storage	0	0	500	Need storage for project files	APPROVED	2026-08-05 19:08:20.913438	1	2026-08-24 13:45:41.706356
6	3	1	1	My Cloud VM	4	8	100	Need VM for final year project development	APPROVED	2026-08-07 14:47:08.773919	1	2026-08-24 13:45:41.706356
4	2	4	3	Application Container	2	4	50	Need Docker container deployment	REJECTED	2026-08-05 19:08:20.913438	1	2026-08-24 13:46:14.212181
9	3	2	3	production web server	10	15	50	this resources is used for server production	APPROVED	2026-08-24 10:58:32.154481	1	2026-08-24 21:17:17.298917
8	3	1	1	my project vm	3	7	91	it is good resources	REJECTED	2026-08-19 10:05:42.975435	1	2026-08-24 21:19:50.371353
1	2	1	1	Student Project VM	4	8	100	Need VM for cloud project development	REJECTED	2026-08-05 19:01:47.798879	1	2026-08-24 21:30:09.616936
38	2	4	1	Application Container	32	40	45	monitoring data fix	APPROVED	2026-09-22 16:17:41.573428	1	2026-09-22 16:18:29.890618
28	2	1	1	Functional Test VM	2	4	50	Testing the complete cloud resource provisioning workflow	APPROVED	2026-09-16 14:07:44.154818	1	2026-09-16 14:26:25.906083
25	3	3	2	Project Storage	33	45	59	data storage	REJECTED	2026-09-10 17:12:18.630935	1	2026-09-17 11:39:49.562404
19	3	5	2	production web server	31	9	49	this is important resource for my project	APPROVED	2026-08-27 10:13:20.854812	1	2026-09-18 11:05:58.989522
29	2	2	2	Functional Test VM	3	6	55	End-to-end testing of cloud resource provisioning workflow	APPROVED	2026-09-18 11:41:44.394453	1	2026-09-18 11:45:17.262966
30	2	1	2	Application Container	22	20	35	Testing expiry date fix	APPROVED	2026-09-19 11:26:46.79789	1	2026-09-19 11:28:15.012572
31	2	2	3	Project Storage	25	19	49	the project storage is under construction	REJECTED	2026-09-19 11:39:24.820979	1	2026-09-19 11:40:37.943883
32	2	1	2	Automatic Allocation Test VM	38	28	50	Final end-to-end testing of cloud resource provisioning	APPROVED	2026-09-19 11:49:38.445968	1	2026-09-19 11:51:18.552769
20	3	4	2	Application Container	35	40	68	this application is need for my project use	APPROVED	2026-09-10 16:58:10.047833	1	2026-09-21 11:03:32.527356
33	3	3	2	Student Database Server	25	37	50	its helpful to store students data	APPROVED	2026-09-21 11:02:23.810631	1	2026-09-22 12:32:02.099821
34	3	1	3	Automatic Allocation Test VM	43	35	55	allocation testing process	APPROVED	2026-09-22 12:28:01.142562	1	2026-09-22 12:42:44.943986
35	2	1	3	Functional Test VM	31	44	82	the functional testing of vm by google cloud	APPROVED	2026-09-22 12:42:11.251276	1	2026-09-22 12:53:58.894879
39	2	1	2	My Cloud VM	13	26	60	testing the monitoring data's	APPROVED	2026-09-22 18:05:41.249201	1	2026-09-22 18:06:33.950031
36	4	3	2	my project vm	57	29	66	my project database is stored	APPROVED	2026-09-22 12:53:33.663877	1	2026-09-22 18:20:46.353908
41	2	1	2	Functional Reject Test	2	4	50	Testing the resource request rejection workflow	REJECTED	2026-09-22 19:02:03.950068	1	2026-09-22 19:13:48.071602
42	2	3	1	Student Database Server	30	23	50	student database server final verification proof	PENDING	2026-09-23 12:20:26.300162	\N	\N
40	4	4	2	Functional Test VM	15	37	50	just expiry data checking	APPROVED	2026-09-22 18:18:29.756353	1	2026-09-23 12:31:54.935218
\.


--
-- TOC entry 5058 (class 0 OID 16716)
-- Dependencies: 227
-- Data for Name: resource_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_types (type_id, type_name, description) FROM stdin;
1	VM	Virtual Machine
2	STORAGE	Cloud Storage
3	DATABASE	Managed Database
4	CONTAINER	Docker Container
5	FUNCTION	Serverless Function
\.


--
-- TOC entry 5062 (class 0 OID 16759)
-- Dependencies: 231
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resources (resource_id, request_id, provider_id, cloud_identifier, resource_status, allocation_date, expiry_date) FROM stdin;
2	2	1	aws-s3-storage-001	ACTIVE	2026-08-05 19:09:37.658137	2027-01-31 23:59:59
5	6	1	aws-ec2-instance-004	ACTIVE	2026-08-10 15:30:00	2026-12-31 23:59:59
6	7	1	aws-resource-1786520142886	ACTIVE	2026-08-12 13:05:42.821196	2026-12-31 23:59:59
3	5	1	aws-ec2-instance-002	ACTIVE	2026-08-10 11:00:00	2026-12-31 23:59:59
7	9	3	aws-resource-1787586437404	ACTIVE	2026-08-24 21:17:17.298917	2026-12-31 00:00:00
1	1	1	aws-ec2-instance-001	TERMINATED	2026-08-05 19:09:37.658137	2026-12-31 23:59:59
9	28	1	aws-resource-1789548985950	ACTIVE	2026-09-16 14:26:25.906083	2026-12-31 00:00:00
12	30	2	aws-resource-1789797495076	ACTIVE	2026-09-19 11:28:15.012572	2026-12-30 00:00:00
10	19	2	aws-resource-1789709759075	ACTIVE	2026-09-18 11:05:58.989522	2026-12-30 00:00:00
11	29	2	aws-resource-1789712117303	ACTIVE	2026-09-18 11:45:17.262966	2026-12-30 00:00:00
13	32	2	aws-resource-1789798878608	ACTIVE	2026-09-19 11:51:18.552769	2027-01-30 00:00:00
14	20	2	aws-resource-1789968812552	ACTIVE	2026-09-21 11:03:32.527356	2026-12-30 00:00:00
15	33	2	aws-resource-1790060522137	ACTIVE	2026-09-22 12:32:02.099821	2026-12-30 00:00:00
16	34	3	aws-resource-1790061164969	ACTIVE	2026-09-22 12:42:44.943986	2026-12-30 00:00:00
17	35	3	aws-resource-1790061838938	ACTIVE	2026-09-22 12:53:58.894879	2026-12-30 00:00:00
18	37	1	aws-resource-1790073400481	ACTIVE	2026-09-22 16:06:40.436865	2026-11-15 00:00:00
19	38	1	aws-resource-1790074109926	ACTIVE	2026-09-22 16:18:29.890618	2026-11-15 00:00:00
21	36	2	azure-resource-1790081446391	ACTIVE	2026-09-22 18:20:46.353908	2027-03-15 00:00:00
22	40	2	azure-resource-1790146914956	ACTIVE	2026-09-23 12:31:54.935218	2026-12-02 00:00:00
20	39	2	aws-resource-1790080593981	ACTIVE	2026-09-22 18:06:33.950031	2026-12-30 00:00:00
\.


--
-- TOC entry 5052 (class 0 OID 16669)
-- Dependencies: 221
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (role_id, permission_id) FROM stdin;
\.


--
-- TOC entry 5049 (class 0 OID 16648)
-- Dependencies: 218
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (role_id, role_name, description) FROM stdin;
1	ADMIN	Full system access
2	USER	Normal user access
3	MANAGER	Approval authority
4	AUDITOR	Monitoring access
\.


--
-- TOC entry 5064 (class 0 OID 16782)
-- Dependencies: 233
-- Data for Name: usage_monitoring; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usage_monitoring (monitoring_id, resource_id, cpu_percent, memory_percent, storage_percent, network_usage, health_status, recorded_at) FROM stdin;
1	1	45.50	60.20	70.00	120.50	HEALTHY	2026-08-12 13:29:25.824616
2	1	72.50	78.30	75.00	250.80	WARNING	2026-08-12 13:32:57.478028
3	1	45.50	60.20	70.00	120.50	HEALTHY	2026-08-12 13:40:21.223969
4	1	45.50	60.20	70.00	120.50	HEALTHY	2026-08-12 13:41:01.318159
5	1	45.50	60.20	70.00	120.50	HEALTHY	2026-08-12 13:41:03.549075
6	1	45.50	60.20	70.00	120.50	HEALTHY	2026-08-12 13:41:05.457318
7	1	45.50	60.20	70.00	120.50	HEALTHY	2026-08-12 13:41:07.070656
8	1	45.50	60.20	70.00	120.50	HEALTHY	2026-08-12 13:41:08.837922
9	1	45.50	60.20	70.00	120.50	HEALTHY	2026-08-12 13:41:10.890271
10	6	35.50	50.20	65.00	150.50	HEALTHY	2026-08-12 13:43:54.120472
11	6	95.00	92.00	90.00	500.00	CRITICAL	2026-08-12 13:49:57.419032
12	7	42.00	58.00	36.00	150.00	HEALTHY	2026-09-03 13:26:11.734335
13	5	54.00	63.00	48.00	180.00	HEALTHY	2026-09-03 13:26:11.734335
14	2	12.00	18.00	64.00	95.00	HEALTHY	2026-09-03 13:26:11.734335
15	3	76.00	72.00	67.00	250.00	WARNING	2026-09-03 13:26:11.734335
16	9	42.50	58.20	36.40	150.50	HEALTHY	2026-09-17 14:02:24.256567
17	19	42.50	58.20	36.40	150.00	HEALTHY	2026-09-22 16:18:29.890618
18	11	42.50	58.20	36.40	150.00	HEALTHY	2026-09-22 17:54:34.926169
19	17	42.50	58.20	36.40	150.00	HEALTHY	2026-09-22 17:54:34.926169
20	12	42.50	58.20	36.40	150.00	HEALTHY	2026-09-22 17:54:34.926169
21	10	42.50	58.20	36.40	150.00	HEALTHY	2026-09-22 17:54:34.926169
22	18	42.50	58.20	36.40	150.00	HEALTHY	2026-09-22 17:54:34.926169
23	15	42.50	58.20	36.40	150.00	HEALTHY	2026-09-22 17:54:34.926169
24	13	42.50	58.20	36.40	150.00	HEALTHY	2026-09-22 17:54:34.926169
25	16	42.50	58.20	36.40	150.00	HEALTHY	2026-09-22 17:54:34.926169
26	14	42.50	58.20	36.40	150.00	HEALTHY	2026-09-22 17:54:34.926169
27	19	42.50	58.20	36.40	150.00	HEALTHY	2026-09-22 17:59:07.717828
28	18	76.00	72.00	67.00	250.00	WARNING	2026-09-22 17:59:07.717828
29	17	95.00	92.00	90.00	500.00	CRITICAL	2026-09-22 17:59:07.717828
30	16	54.00	63.00	48.00	180.00	HEALTHY	2026-09-22 17:59:07.717828
31	15	82.00	79.00	75.00	320.00	WARNING	2026-09-22 17:59:07.717828
32	14	97.00	94.00	93.00	550.00	CRITICAL	2026-09-22 17:59:07.717828
33	13	35.00	45.00	30.00	120.00	HEALTHY	2026-09-22 17:59:07.717828
34	12	68.00	70.00	61.00	230.00	WARNING	2026-09-22 17:59:07.717828
35	11	91.00	88.00	86.00	450.00	CRITICAL	2026-09-22 17:59:07.717828
36	10	25.00	38.00	45.00	100.00	HEALTHY	2026-09-22 17:59:07.717828
37	20	45.00	50.00	50.00	130.00	HEALTHY	2026-09-22 18:33:47.373497
38	21	40.00	50.00	50.00	570.00	HEALTHY	2026-09-22 18:34:01.550156
39	22	45.00	60.00	40.00	150.00	HEALTHY	2026-09-23 12:31:54.935218
\.


--
-- TOC entry 5054 (class 0 OID 16685)
-- Dependencies: 223
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, full_name, email, password_hash, role_id, status, created_at) FROM stdin;
3	Johitha	Johitha Sri	johi@example.com	$2b$10$rrtL9oQZ.zPEm5NlH2VDuuH7CmXwXvEaB99F2HasThbK6uVx2P9Pi	2	ACTIVE	2026-08-06 10:13:40.989452
1	admin	System Administrator	admin@example.com	$2b$10$7H2xzhkWeNJvB/vuHSzTQ.CMarvbRqnjOpVNFwHyp6McEEQ4S8d9e	1	ACTIVE	2026-08-05 18:44:56.068155
2	hema	Hemalatha	hema@example.com	$2b$10$7/mRnURhqyvIX8lnzdMN1e9VZsOtJ4.SaOLTKygbhBgUgP/NJkr4m	2	ACTIVE	2026-08-05 18:44:56.068155
4	shrinika	Shrinika Senthil	shri@example.com	$2b$10$2q5gNCvfoQ1064dCWSunleiKL8g5/b41CDgBVCSrJi3Fhw7V6Mszu	2	ACTIVE	2026-09-15 12:53:36.736609
\.


--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 238
-- Name: audit_logs_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_log_id_seq', 4, true);


--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 224
-- Name: cloud_providers_provider_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cloud_providers_provider_id_seq', 3, true);


--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 236
-- Name: login_history_login_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.login_history_login_id_seq', 2, true);


--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 240
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 39, true);


--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 219
-- Name: permissions_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_permission_id_seq', 5, true);


--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 242
-- Name: reports_report_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reports_report_id_seq', 1, false);


--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 234
-- Name: resource_cost_cost_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.resource_cost_cost_id_seq', 2, true);


--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 228
-- Name: resource_requests_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.resource_requests_request_id_seq', 42, true);


--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 226
-- Name: resource_types_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.resource_types_type_id_seq', 5, true);


--
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 230
-- Name: resources_resource_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.resources_resource_id_seq', 22, true);


--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 217
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_role_id_seq', 4, true);


--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 232
-- Name: usage_monitoring_monitoring_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usage_monitoring_monitoring_id_seq', 39, true);


--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 4, true);


--
-- TOC entry 4881 (class 2606 OID 16829)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (log_id);


--
-- TOC entry 4855 (class 2606 OID 16712)
-- Name: cloud_providers cloud_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cloud_providers
    ADD CONSTRAINT cloud_providers_pkey PRIMARY KEY (provider_id);


--
-- TOC entry 4857 (class 2606 OID 16714)
-- Name: cloud_providers cloud_providers_provider_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cloud_providers
    ADD CONSTRAINT cloud_providers_provider_name_key UNIQUE (provider_name);


--
-- TOC entry 4879 (class 2606 OID 16814)
-- Name: login_history login_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_history
    ADD CONSTRAINT login_history_pkey PRIMARY KEY (login_id);


--
-- TOC entry 4883 (class 2606 OID 16845)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- TOC entry 4842 (class 2606 OID 16668)
-- Name: permissions permissions_permission_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_permission_name_key UNIQUE (permission_name);


--
-- TOC entry 4844 (class 2606 OID 16666)
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (permission_id);


--
-- TOC entry 4885 (class 2606 OID 16858)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (report_id);


--
-- TOC entry 4877 (class 2606 OID 16801)
-- Name: resource_cost resource_cost_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_cost
    ADD CONSTRAINT resource_cost_pkey PRIMARY KEY (cost_id);


--
-- TOC entry 4864 (class 2606 OID 16737)
-- Name: resource_requests resource_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_requests
    ADD CONSTRAINT resource_requests_pkey PRIMARY KEY (request_id);


--
-- TOC entry 4859 (class 2606 OID 16723)
-- Name: resource_types resource_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_types
    ADD CONSTRAINT resource_types_pkey PRIMARY KEY (type_id);


--
-- TOC entry 4861 (class 2606 OID 16725)
-- Name: resource_types resource_types_type_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_types
    ADD CONSTRAINT resource_types_type_name_key UNIQUE (type_name);


--
-- TOC entry 4867 (class 2606 OID 16770)
-- Name: resources resources_cloud_identifier_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_cloud_identifier_key UNIQUE (cloud_identifier);


--
-- TOC entry 4869 (class 2606 OID 16766)
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (resource_id);


--
-- TOC entry 4871 (class 2606 OID 16768)
-- Name: resources resources_request_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_request_id_key UNIQUE (request_id);


--
-- TOC entry 4846 (class 2606 OID 16673)
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- TOC entry 4838 (class 2606 OID 16655)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- TOC entry 4840 (class 2606 OID 16657)
-- Name: roles roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);


--
-- TOC entry 4874 (class 2606 OID 16788)
-- Name: usage_monitoring usage_monitoring_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usage_monitoring
    ADD CONSTRAINT usage_monitoring_pkey PRIMARY KEY (monitoring_id);


--
-- TOC entry 4849 (class 2606 OID 16698)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4851 (class 2606 OID 16694)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4853 (class 2606 OID 16696)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4875 (class 1259 OID 16868)
-- Name: idx_cost_resource; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cost_resource ON public.resource_cost USING btree (resource_id);


--
-- TOC entry 4872 (class 1259 OID 16867)
-- Name: idx_monitor_resource; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_monitor_resource ON public.usage_monitoring USING btree (resource_id);


--
-- TOC entry 4862 (class 1259 OID 16865)
-- Name: idx_request_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_request_user ON public.resource_requests USING btree (user_id);


--
-- TOC entry 4865 (class 1259 OID 16866)
-- Name: idx_resource_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_resource_status ON public.resources USING btree (resource_status);


--
-- TOC entry 4847 (class 1259 OID 16864)
-- Name: idx_user_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_email ON public.users USING btree (email);


--
-- TOC entry 4901 (class 2620 OID 16877)
-- Name: resource_requests request_status_notification_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER request_status_notification_trigger AFTER UPDATE OF status ON public.resource_requests FOR EACH ROW EXECUTE FUNCTION public.notify_user_request_status();


--
-- TOC entry 4902 (class 2620 OID 16873)
-- Name: resource_requests trigger_notify_admin_new_request; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_notify_admin_new_request AFTER INSERT ON public.resource_requests FOR EACH ROW EXECUTE FUNCTION public.notify_admin_new_request();


--
-- TOC entry 4898 (class 2606 OID 16830)
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4897 (class 2606 OID 16815)
-- Name: login_history login_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_history
    ADD CONSTRAINT login_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4899 (class 2606 OID 16846)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4900 (class 2606 OID 16859)
-- Name: reports reports_generated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES public.users(user_id);


--
-- TOC entry 4896 (class 2606 OID 16802)
-- Name: resource_cost resource_cost_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_cost
    ADD CONSTRAINT resource_cost_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(resource_id) ON DELETE CASCADE;


--
-- TOC entry 4889 (class 2606 OID 16748)
-- Name: resource_requests resource_requests_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_requests
    ADD CONSTRAINT resource_requests_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.cloud_providers(provider_id);


--
-- TOC entry 4890 (class 2606 OID 16753)
-- Name: resource_requests resource_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_requests
    ADD CONSTRAINT resource_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(user_id);


--
-- TOC entry 4891 (class 2606 OID 16743)
-- Name: resource_requests resource_requests_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_requests
    ADD CONSTRAINT resource_requests_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.resource_types(type_id);


--
-- TOC entry 4892 (class 2606 OID 16738)
-- Name: resource_requests resource_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_requests
    ADD CONSTRAINT resource_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4893 (class 2606 OID 16776)
-- Name: resources resources_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.cloud_providers(provider_id);


--
-- TOC entry 4894 (class 2606 OID 16771)
-- Name: resources resources_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.resource_requests(request_id) ON DELETE CASCADE;


--
-- TOC entry 4886 (class 2606 OID 16679)
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(permission_id) ON DELETE CASCADE;


--
-- TOC entry 4887 (class 2606 OID 16674)
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE CASCADE;


--
-- TOC entry 4895 (class 2606 OID 16789)
-- Name: usage_monitoring usage_monitoring_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usage_monitoring
    ADD CONSTRAINT usage_monitoring_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(resource_id) ON DELETE CASCADE;


--
-- TOC entry 4888 (class 2606 OID 16699)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id);


-- Completed on 2026-10-04 09:36:33

--
-- PostgreSQL database dump complete
--

\unrestrict nLWkMuA2jz6Wg8bP2Dd2wbiHOFgfJRSFmhtZB7xjcMU8Sqjggy1u2AikOwyuS0A

