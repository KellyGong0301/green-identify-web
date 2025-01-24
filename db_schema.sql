--
-- PostgreSQL database dump
--

-- Dumped from database version 15.10 (Homebrew)
-- Dumped by pg_dump version 15.10 (Homebrew)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Plant; Type: TABLE; Schema: public; Owner: yugon
--

CREATE TABLE public."Plant" (
    id text NOT NULL,
    "commonName" text NOT NULL,
    "scientificName" text NOT NULL,
    description text,
    "imageUrl" text,
    "careInfo" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public."Plant" OWNER TO yugon;

--
-- Name: User; Type: TABLE; Schema: public; Owner: yugon
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO yugon;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: yugon
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO yugon;

--
-- Name: Plant Plant_pkey; Type: CONSTRAINT; Schema: public; Owner: yugon
--

ALTER TABLE ONLY public."Plant"
    ADD CONSTRAINT "Plant_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: yugon
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: yugon
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Plant_userId_idx; Type: INDEX; Schema: public; Owner: yugon
--

CREATE INDEX "Plant_userId_idx" ON public."Plant" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: yugon
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Plant Plant_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yugon
--

ALTER TABLE ONLY public."Plant"
    ADD CONSTRAINT "Plant_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

