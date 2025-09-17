CREATE TYPE "public"."adjustment_type" AS ENUM('ADD_TIME', 'REMOVE_TIME', 'RESCHEDULE');--> statement-breakpoint
CREATE TYPE "public"."execution_status" AS ENUM('STARTED', 'COMPLETED', 'STOPPED', 'INTERRUPTED');--> statement-breakpoint
CREATE TYPE "public"."timer_status" AS ENUM('PENDING', 'RUNNING', 'COMPLETED', 'PAUSED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."participant_role" AS ENUM('OWNER', 'COORDINATOR', 'PARTICIPANT', 'VIEW_ONLY');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "timer" (
	"id" text PRIMARY KEY NOT NULL,
	"wedding_event_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"scheduled_start_time" timestamp NOT NULL,
	"duration_minutes" integer NOT NULL,
	"status" timer_status DEFAULT 'PENDING' NOT NULL,
	"sound_file_url" text,
	"image_file_url" text,
	"order_index" integer NOT NULL,
	"created_by_id" text NOT NULL,
	"last_modified_by_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timer_adjustment" (
	"id" text PRIMARY KEY NOT NULL,
	"timer_id" text NOT NULL,
	"adjustment_type" "adjustment_type" NOT NULL,
	"minutes_added" integer NOT NULL,
	"cascade_to_following" boolean DEFAULT false NOT NULL,
	"reason" text,
	"created_by_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timer_execution" (
	"id" text PRIMARY KEY NOT NULL,
	"timer_id" text NOT NULL,
	"actual_start_time" timestamp NOT NULL,
	"actual_end_time" timestamp,
	"actual_duration_minutes" integer,
	"status" "execution_status" NOT NULL,
	"started_by_id" text NOT NULL,
	"stopped_by_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todo" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "todo_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"text" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wedding_event" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"event_date" timestamp NOT NULL,
	"location" text,
	"owner_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wedding_participant" (
	"id" text PRIMARY KEY NOT NULL,
	"wedding_event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "participant_role" NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timer" ADD CONSTRAINT "timer_wedding_event_id_wedding_event_id_fk" FOREIGN KEY ("wedding_event_id") REFERENCES "public"."wedding_event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timer" ADD CONSTRAINT "timer_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timer" ADD CONSTRAINT "timer_last_modified_by_id_user_id_fk" FOREIGN KEY ("last_modified_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timer_adjustment" ADD CONSTRAINT "timer_adjustment_timer_id_timer_id_fk" FOREIGN KEY ("timer_id") REFERENCES "public"."timer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timer_adjustment" ADD CONSTRAINT "timer_adjustment_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timer_execution" ADD CONSTRAINT "timer_execution_timer_id_timer_id_fk" FOREIGN KEY ("timer_id") REFERENCES "public"."timer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timer_execution" ADD CONSTRAINT "timer_execution_started_by_id_user_id_fk" FOREIGN KEY ("started_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timer_execution" ADD CONSTRAINT "timer_execution_stopped_by_id_user_id_fk" FOREIGN KEY ("stopped_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wedding_event" ADD CONSTRAINT "wedding_event_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wedding_participant" ADD CONSTRAINT "wedding_participant_wedding_event_id_wedding_event_id_fk" FOREIGN KEY ("wedding_event_id") REFERENCES "public"."wedding_event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wedding_participant" ADD CONSTRAINT "wedding_participant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;