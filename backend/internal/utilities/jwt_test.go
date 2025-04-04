package utilities

import (
	"github.com/golang-jwt/jwt/v5"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestJWTTokenCreationAndVerification(t *testing.T) {
	testUUID := "123e4567-e89b-12d3-a456-426614174000"

	token, err := CreateJwtToken(testUUID)
	assert.NoError(t, err)
	assert.NotEmpty(t, token)

	err = VerifyJwtToken(token)
	assert.NoError(t, err)

	uuid, err := ExtractUUIDFromToken(token)
	assert.NoError(t, err)
	assert.Equal(t, testUUID, uuid)
}

func TestExpiredJWTToken(t *testing.T) {

	oldKey := defaultSecretKey
	defaultSecretKey = []byte("test-secret-key-1234567890-1234567890")
	defer func() { defaultSecretKey = oldKey }()

	testUUID := "123e4567-e89b-12d3-a456-426614174000"

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"uuid": testUUID,
		"exp":  time.Now().Add(-time.Hour).Unix(),
	})
	tokenString, err := token.SignedString(defaultSecretKey)
	assert.NoError(t, err)

	err = VerifyJwtToken(tokenString)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "token is expired")
}
