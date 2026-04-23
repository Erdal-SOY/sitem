--
-- PostgreSQL database dump
--

\restrict srLJLZmJevq6IKtwCO8Bvil5rW7UOp5izpEkhNJp1kcp35rNnhPBZzx4XWCIf5f

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

-- Started on 2026-04-24 00:51:02

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 32850)
-- Name: favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorites (
    id integer NOT NULL,
    user_id integer NOT NULL,
    listing_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.favorites OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 32849)
-- Name: favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.favorites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.favorites_id_seq OWNER TO postgres;

--
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 225
-- Name: favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.favorites_id_seq OWNED BY public.favorites.id;


--
-- TOC entry 222 (class 1259 OID 32791)
-- Name: listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.listings (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(150) NOT NULL,
    description text NOT NULL,
    category character varying(100) NOT NULL,
    city character varying(100) NOT NULL,
    item_condition character varying(50) NOT NULL,
    image_url text,
    desired_trade text,
    eco_point integer DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    listing_type character varying(20) DEFAULT 'trade'::character varying NOT NULL
);


ALTER TABLE public.listings OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 32790)
-- Name: listings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.listings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.listings_id_seq OWNER TO postgres;

--
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 221
-- Name: listings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.listings_id_seq OWNED BY public.listings.id;


--
-- TOC entry 224 (class 1259 OID 32820)
-- Name: offers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.offers (
    id integer NOT NULL,
    listing_id integer NOT NULL,
    sender_id integer NOT NULL,
    message text NOT NULL,
    offered_item character varying(150) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    cash_offer numeric(10,2) DEFAULT 0,
    owner_response_message text,
    counter_offered_item character varying(150),
    counter_cash_amount numeric(10,2) DEFAULT 0,
    last_action_by character varying(20) DEFAULT 'sender'::character varying,
    offered_image_url text,
    counter_image_url text,
    sender_phone character varying(30),
    sender_whatsapp character varying(30),
    preferred_contact_method character varying(20),
    meetup_note text,
    trade_stage character varying(30) DEFAULT 'negotiation'::character varying,
    trade_planned_at timestamp without time zone,
    trade_completed_at timestamp without time zone
);


ALTER TABLE public.offers OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 32819)
-- Name: offers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.offers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.offers_id_seq OWNER TO postgres;

--
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 223
-- Name: offers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.offers_id_seq OWNED BY public.offers.id;


--
-- TOC entry 228 (class 1259 OID 32882)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    offer_id integer NOT NULL,
    reviewer_id integer NOT NULL,
    reviewee_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 32881)
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 227
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- TOC entry 220 (class 1259 OID 32770)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(120) NOT NULL,
    password character varying(255) NOT NULL,
    city character varying(100),
    avatar_url text,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    verification_token character varying(255),
    verification_expires timestamp without time zone,
    reset_password_token character varying(255),
    reset_password_expires timestamp without time zone,
    phone character varying(30),
    whatsapp character varying(30),
    public_contact_note text,
    preferred_contact_method character varying(20) DEFAULT 'phone'::character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 32769)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4896 (class 2604 OID 32853)
-- Name: favorites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites ALTER COLUMN id SET DEFAULT nextval('public.favorites_id_seq'::regclass);


--
-- TOC entry 4882 (class 2604 OID 32794)
-- Name: listings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings ALTER COLUMN id SET DEFAULT nextval('public.listings_id_seq'::regclass);


--
-- TOC entry 4888 (class 2604 OID 32823)
-- Name: offers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offers ALTER COLUMN id SET DEFAULT nextval('public.offers_id_seq'::regclass);


--
-- TOC entry 4898 (class 2604 OID 32885)
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- TOC entry 4876 (class 2604 OID 32773)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5080 (class 0 OID 32850)
-- Dependencies: 226
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favorites (id, user_id, listing_id, created_at) FROM stdin;
1	2	1	2026-04-01 00:48:50.181229
5	5	1	2026-04-01 01:30:41.65165
7	13	1	2026-04-02 00:44:09.948333
8	13	14	2026-04-02 00:55:38.08959
10	17	13	2026-04-14 17:41:47.644481
\.


--
-- TOC entry 5076 (class 0 OID 32791)
-- Dependencies: 222
-- Data for Name: listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.listings (id, user_id, title, description, category, city, item_condition, image_url, desired_trade, eco_point, status, created_at, updated_at, listing_type) FROM stdin;
1	1	Az Kullanılmış Blender - Güncel	Çalışır durumda, temiz kullanıldı.	Mutfak	İstanbul	İyi	https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=900&q=80	Kitaplık veya saklama kutusu	35	active	2026-03-31 19:06:51.714763	2026-03-31 19:09:23.926679	trade
10	13	Taşınabilir Bluetooth Hoparlör	Ses seviyesi gayet iyi. Şarjı ortalama 5-6 saat gidiyor.	Elektronik	kırşehir	Yeni Gibi	http://localhost:5000/uploads/1775062455628-791654446.webp	Powerbank	0	active	2026-04-01 19:54:15.635783	2026-04-01 19:54:15.635783	trade
11	13	Kadın Kaban	Sadece birkaç kez giyildi. Cepleri sağlam, lekesiz.	Giyim	ankara	Yeni Gibi	http://localhost:5000/uploads/1775074234631-774759462.jpg	Sırt çantası	0	active	2026-04-01 23:10:34.649284	2026-04-01 23:10:34.649284	trade
12	13	20 Jant Çocuk Bisikleti	Kullanıma uygun, sadece kozmetik çizikler var. Frenler çalışıyor.	Spor	konya	Orta	http://localhost:5000/uploads/1775074378308-429474993.jpg	Scooter	0	active	2026-04-01 23:12:58.316104	2026-04-01 23:12:58.316104	trade
13	13	Ahşap Çalışma Sandalyesi	Sallanma yok, gayet sağlam. Yüzeyde ufak kullanım izleri mevcut.	Mobilya	eskişehir	İyi	http://localhost:5000/uploads/1775074475878-148030109.webp	Küçük raf veya masa üstü organizer	0	active	2026-04-01 23:14:35.887206	2026-04-01 23:14:35.887206	trade
14	17	Masa Lambası	Yeni gibidir. İki hafta önce aldım sorunsuz çalışıyor çalışma masassı için ideal.	Dekorasyon	kocaeli	Çok İyi	http://localhost:5000/uploads/1775080265692-868841543.jpg	led ışık	0	active	2026-04-02 00:51:05.709911	2026-04-02 00:51:05.709911	trade
15	17	ss	sss	Giyim	s	İyi	http://localhost:5000/uploads/1776183979673-939837502.png	\N	0	active	2026-04-14 19:26:19.7068	2026-04-14 19:26:19.7068	free
\.


--
-- TOC entry 5078 (class 0 OID 32820)
-- Dependencies: 224
-- Data for Name: offers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.offers (id, listing_id, sender_id, message, offered_item, status, created_at, updated_at, cash_offer, owner_response_message, counter_offered_item, counter_cash_amount, last_action_by, offered_image_url, counter_image_url, sender_phone, sender_whatsapp, preferred_contact_method, meetup_note, trade_stage, trade_planned_at, trade_completed_at) FROM stdin;
1	1	1	Bu blender için kitaplık teklif ediyorum	Kitaplık	pending	2026-03-31 19:15:05.334296	2026-03-31 19:15:05.334296	0.00	\N	\N	0.00	sender	\N	\N	\N	\N	\N	\N	negotiation	\N	\N
3	1	3	adsvsvsa	cdavs	pending	2026-04-01 01:03:34.036624	2026-04-01 01:03:34.036624	0.00	\N	\N	0.00	sender	\N	\N	\N	\N	\N	\N	negotiation	\N	\N
5	1	5	dlkasnkklsa	hjsah	pending	2026-04-01 01:31:08.624879	2026-04-01 01:31:08.624879	0.00	\N	\N	0.00	sender	\N	\N	\N	\N	\N	\N	negotiation	\N	\N
6	1	2	dsafs	cdsafdasf	pending	2026-04-01 01:54:39.14841	2026-04-01 01:54:39.14841	500.00	\N	\N	0.00	sender	\N	\N	\N	\N	\N	\N	negotiation	\N	\N
14	13	17	d		rejected	2026-04-14 19:16:56.651258	2026-04-14 19:28:25.332291	0.00	\N	\N	0.00	owner	\N	\N	0534 015 11 36	05340151136	phone	\N	cancelled	\N	\N
15	15	13	istiyoooooooom	Karşılıksız teslim talebi	accepted	2026-04-14 19:27:52.92347	2026-04-14 19:28:53.352762	0.00	\N	\N	0.00	owner	\N	\N	\N	\N	phone	\N	contact_shared	\N	\N
10	1	17	elimdeki airfryer çok iyi durumda yeni hiç kullanmadım 	airfryer	pending	2026-04-02 00:53:34.559529	2026-04-02 00:53:34.559529	998.00	\N	\N	0.00	sender	\N	\N	0534 015 11 36	05340151136	phone	\N	negotiation	\N	\N
11	1	17	adsghfushfjk dsahfjklsahflkjsha sadofhashfjklhdsajkl sdajkbhfjklsabhljkgbfdklsaj sodagbfdjklsaghfjklsb sadghfjkbhjklds	airfryer	pending	2026-04-02 00:54:26.760713	2026-04-02 00:54:26.760713	1500.00	\N	\N	0.00	sender	http://localhost:5000/uploads/1775080466750-641285274.webp	\N	0534 015 11 36	05340151136	phone	\N	negotiation	\N	\N
12	14	13	adsgfdhasghgfdhsa dsgakfjgsahf dsaghk	airfryer	rejected	2026-04-02 00:56:10.386039	2026-04-02 01:13:50.165416	1500.00	1500 çok 500 vereyim	aynı ürün	0.00	sender	http://localhost:5000/uploads/1775080570377-728462349.webp	\N	\N	\N	phone	\N	cancelled	2026-04-02 00:59:54.42	2026-04-02 01:00:04.167
13	14	13	asd	xxx	rejected	2026-04-02 01:14:37.61619	2026-04-02 01:18:40.387996	0.00	fdsdgsdd	\N	0.00	sender	http://localhost:5000/uploads/1775081677603-844480704.webp	\N	\N	\N	phone	asd\n\n\njhsfjdghfjkhgjkldfhjkldh	cancelled	2026-04-02 01:17:48.881	2026-04-02 01:17:51.402
\.


--
-- TOC entry 5082 (class 0 OID 32882)
-- Dependencies: 228
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, offer_id, reviewer_id, reviewee_id, rating, comment, created_at) FROM stdin;
\.


--
-- TOC entry 5074 (class 0 OID 32770)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, city, avatar_url, role, created_at, updated_at, is_verified, verification_token, verification_expires, reset_password_token, reset_password_expires, phone, whatsapp, public_contact_note, preferred_contact_method) FROM stdin;
1	Naz	naz@example.com	$2b$10$LjIqyaMjbpG3hUK6nrMyJum2j/ELTFT/Na18OS8UjaxnnAO3Qz7yO	Balıkesir	\N	user	2026-03-31 18:58:40.400342	2026-03-31 18:58:40.400342	f	\N	\N	\N	\N	\N	\N	\N	phone
3	abc	abc@gmail.com	$2b$10$bLsACTFiz2VqjdH6KOAe3eEHq.S2a2WjZAwkcMMdyNJycUDHgbHwi	muğla	\N	user	2026-04-01 01:03:07.980025	2026-04-01 01:03:07.980025	f	\N	\N	\N	\N	\N	\N	\N	phone
4	erdal	erdall@gmail.com	$2b$10$mL1KYF6A1NXfeYN9Qh9fL.d9V0haybkI2D.1Tj5akpoizdJleJgaC	kocaeli		user	2026-04-01 01:06:41.923963	2026-04-01 01:07:51.116734	f	\N	\N	\N	\N	\N	\N	\N	phone
5	yiğit	yigitkandemi@gmail.com	$2b$10$s/u9viRINR44Vm3dzWlzCOOyFmTJ9R2xJByFhMBg2tBnsNmz7FpOq	bursa	\N	user	2026-04-01 01:30:07.547473	2026-04-01 01:30:07.547473	f	\N	\N	\N	\N	\N	\N	\N	phone
2	deneme	dnm@gmail.com	123456	sivas	\N	user	2026-03-31 20:15:59.664458	2026-03-31 20:15:59.664458	f	\N	\N	\N	\N	\N	\N	\N	phone
6	zxc	zxc@gmail.com	$2b$10$anf1rv7Wl9qvUfrEHVFjPewb3qsHNWCpHJuTNvNLOJsai.aE4p.QW	adana	\N	user	2026-04-01 02:15:25.115622	2026-04-01 02:15:25.115622	f	\N	\N	\N	\N	\N	\N	\N	phone
7	erdal	erdalsoy@gmail.com	$2b$10$rRzqDdmXz3.bHzuDJ7rqPeQXnGAc246rx3AaKB2BJQWHzsp3mhM.q	kocaeli	\N	user	2026-04-01 17:35:18.714529	2026-04-01 17:35:18.714529	f	\N	\N	\N	\N	\N	\N	\N	phone
13	Naz BIYIK	statevelemming@gmail.com	$2b$10$1zp19/ddFr.PEgZ0fKue5.4HK9.0qcoiPYJRM/wQ9gyP0vEkLlpx6	kırşehir	\N	user	2026-04-01 19:04:12.645793	2026-04-01 19:04:23.992734	t	\N	\N	\N	\N	\N	\N	\N	phone
17	Erdal SOY	erdalsoy3641@gmail.com	$2b$10$yfWPVFs6FogebGJw8mMIMOcek29GxUWeIFxVDaHgIF7UZV8A99F2S	Kocaeli		user	2026-04-02 00:46:44.724556	2026-04-02 00:48:16.959504	t	\N	\N	\N	\N	0534 015 11 36	05340151136	akşam 5 den önce arayınız	phone
\.


--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 225
-- Name: favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.favorites_id_seq', 10, true);


--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 221
-- Name: listings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.listings_id_seq', 15, true);


--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 223
-- Name: offers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.offers_id_seq', 15, true);


--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 227
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, true);


--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 17, true);


--
-- TOC entry 4910 (class 2606 OID 32860)
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- TOC entry 4906 (class 2606 OID 32813)
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- TOC entry 4908 (class 2606 OID 32838)
-- Name: offers offers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_pkey PRIMARY KEY (id);


--
-- TOC entry 4915 (class 2606 OID 32898)
-- Name: reviews reviews_offer_id_reviewer_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_offer_id_reviewer_id_key UNIQUE (offer_id, reviewer_id);


--
-- TOC entry 4917 (class 2606 OID 32896)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 4913 (class 2606 OID 32862)
-- Name: favorites unique_user_listing; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT unique_user_listing UNIQUE (user_id, listing_id);


--
-- TOC entry 4902 (class 2606 OID 32789)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4904 (class 2606 OID 32787)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4911 (class 1259 OID 32873)
-- Name: idx_favorites_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_favorites_user_id ON public.favorites USING btree (user_id);


--
-- TOC entry 4921 (class 2606 OID 32868)
-- Name: favorites fk_favorite_listing; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT fk_favorite_listing FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- TOC entry 4922 (class 2606 OID 32863)
-- Name: favorites fk_favorite_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4918 (class 2606 OID 32814)
-- Name: listings fk_listing_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT fk_listing_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4919 (class 2606 OID 32839)
-- Name: offers fk_offer_listing; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT fk_offer_listing FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- TOC entry 4920 (class 2606 OID 32844)
-- Name: offers fk_offer_sender; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT fk_offer_sender FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4923 (class 2606 OID 32899)
-- Name: reviews reviews_offer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_offer_id_fkey FOREIGN KEY (offer_id) REFERENCES public.offers(id) ON DELETE CASCADE;


--
-- TOC entry 4924 (class 2606 OID 32909)
-- Name: reviews reviews_reviewee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewee_id_fkey FOREIGN KEY (reviewee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4925 (class 2606 OID 32904)
-- Name: reviews reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-04-24 00:51:03

--
-- PostgreSQL database dump complete
--

\unrestrict srLJLZmJevq6IKtwCO8Bvil5rW7UOp5izpEkhNJp1kcp35rNnhPBZzx4XWCIf5f

