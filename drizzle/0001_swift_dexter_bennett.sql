ALTER TABLE "examples" RENAME TO "workflows";--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "org_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "graph" jsonb;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;