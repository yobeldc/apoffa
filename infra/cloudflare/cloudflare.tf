terraform {
  required_providers {
    cloudflare = { source = "cloudflare/cloudflare", version = "~> 4.0" }
  }
}

provider "cloudflare" { api_token = var.cloudflare_api_token }

variable "cloudflare_api_token" { type = string sensitive = true }
variable "cloudflare_account_id" { type = string }
variable "zone_id" { type = string }
variable "domain" { type = string default = "apoffa.app" }
variable "environment" { type = string default = "production" }

resource "cloudflare_workers_script" "api" {
  account_id = var.cloudflare_account_id
  name       = "apoffa-api-${var.environment}"
  content    = file("${path.module}/../../dist/worker.js")
  module     = true
  compatibility_date = "2024-01-01"
}

resource "cloudflare_pages_project" "frontend" {
  account_id        = var.cloudflare_account_id
  name              = "apoffa-frontend"
  production_branch = "main"
}

resource "cloudflare_r2_bucket" "documents" {
  account_id = var.cloudflare_account_id
  name       = "apoffa-documents-${var.environment}"
}

resource "cloudflare_r2_bucket" "backups" {
  account_id = var.cloudflare_account_id
  name       = "apoffa-backups-${var.environment}"
}

resource "cloudflare_d1_database" "metadata" {
  account_id = var.cloudflare_account_id
  name       = "apoffa-metadata-${var.environment}"
}

resource "cloudflare_workers_kv_namespace" "cache" {
  account_id = var.cloudflare_account_id
  title      = "apoffa-cache-${var.environment}"
}

output "api_url" { value = "https://api.${var.domain}" }
output "frontend_url" { value = "https://${var.domain}" }
