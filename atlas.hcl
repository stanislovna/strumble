env "supabase" {
  src = "file://atlas/schema.sql"
  
  # Use the format: url?search_path=public
  url = "${getenv("SUPABASE_DB_URL")}?search_path=public"
  
  dev = "docker://postgres/15/dev?search_path=public"
  
  migration {
    dir = "file://atlas/migrations"
  }
  
  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}

env "local" {
  src = "file://atlas/schema.sql"
  url = "postgresql://postgres:postgres@localhost:54322/postgres?search_path=public"
  
  dev = "docker://postgres/15/dev?search_path=public"
  
  migration {
    dir = "file://atlas/migrations"
  }
}
