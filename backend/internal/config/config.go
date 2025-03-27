package config

import (
	"log"

	"github.com/spf13/viper"
)

var (
	PORT                 int
	POSTGRES_USER        string
	POSTGRES_PASSWORD    string
	POSTGRES_DB          string
	DATABASE_URL         string
	GOOGLE_CLIENT_ID     string
	GOOGLE_CLIENT_SECRET string
	GOOGLE_REDIRECT_URL  string
	JWT_SECRET_KEY       string
	RABBITMQ_URL         string
)

func Load() {
	viper.SetDefault("PORT", 8000)
	viper.SetDefault("POSTGRES_USER", "postgres")
	viper.SetDefault("POSTGRES_PASSWORD", "@Password123")
	viper.SetDefault("POSTGRES_DB", "postgres")
	viper.SetDefault("DATABASE_URL", "localhost")
	viper.SetDefault("GOOGLE_CLIENT_ID", "google_client_id")
	viper.SetDefault("GOOGLE_CLIENT_SECRET", "google_client_secret")
	viper.SetDefault("JWT_SECRET_KEY", "jwt_secret_key")
	viper.SetDefault("GOOGLE_REDIRECT_URL", "http://localhost:8000/auth/login/google")
	viper.SetDefault("RABBITMQ_URL", "amqp://user:password@localhost:5672/")

	viper.SetConfigFile(".env")
	viper.AddConfigPath("../../.")

	if err := viper.ReadInConfig(); err != nil {
		log.Printf("Warning: Could not read config file: %v", err)
	}

	viper.AutomaticEnv()

	PORT = viper.GetInt("PORT")
	POSTGRES_USER = viper.GetString("POSTGRES_USER")
	POSTGRES_PASSWORD = viper.GetString("POSTGRES_PASSWORD")
	POSTGRES_DB = viper.GetString("POSTGRES_DB")
	DATABASE_URL = viper.GetString("DATABASE_URL")
	GOOGLE_CLIENT_ID = viper.GetString("GOOGLE_CLIENT_ID")
	GOOGLE_CLIENT_SECRET = viper.GetString("GOOGLE_CLIENT_SECRET")
	GOOGLE_REDIRECT_URL = viper.GetString("GOOGLE_REDIRECT_URL")
	JWT_SECRET_KEY = viper.GetString("JWT_SECRET_KEY")
	RABBITMQ_URL = viper.GetString("RABBITMQ_URL")
}
