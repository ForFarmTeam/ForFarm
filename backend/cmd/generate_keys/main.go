package main

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"os"
)

func main() {
	key := make([]byte, 64)
	_, err := rand.Read(key)
	if err != nil {
		fmt.Println("Error generating key:", err)
		os.Exit(1)
	}

	secret := base64.StdEncoding.EncodeToString(key)
	fmt.Println("Generated JWT Secret (add to your .env as JWT_SECRET_KEY):")
	fmt.Println(secret)
}
