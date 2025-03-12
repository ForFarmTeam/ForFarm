package utilities

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
)

type GoogleTokenInfo struct {
	Sub   string `json:"sub"`   // Unique Google user identifier.
	Email string `json:"email"` // The user's email address.
}

func ExtractGoogleUserID(idToken string) (string, string, error) {
	if idToken == "" {
		return "", "", errors.New("provided id token is empty")
	}

	url := fmt.Sprintf("https://oauth2.googleapis.com/tokeninfo?id_token=%s", idToken)
	resp, err := http.Get(url)
	if err != nil {
		return "", "", fmt.Errorf("error verifying Google ID token: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", "", fmt.Errorf("tokeninfo endpoint returned unexpected status: %d", resp.StatusCode)
	}

	var tokenInfo GoogleTokenInfo
	if err := json.NewDecoder(resp.Body).Decode(&tokenInfo); err != nil {
		return "", "", fmt.Errorf("error decoding token info response: %w", err)
	}

	if tokenInfo.Sub == "" {
		return "", "", errors.New("Google token missing 'sub' claim")
	}

	return tokenInfo.Sub, tokenInfo.Email, nil
}
