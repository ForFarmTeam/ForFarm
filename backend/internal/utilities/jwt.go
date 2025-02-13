package utilities

import (
	"errors"
	"time"

	"github.com/forfarm/backend/internal/config"
	"github.com/golang-jwt/jwt/v5"
)

// TODO: Change later
var deafultSecretKey = []byte(config.JWT_SECRET_KEY)

func CreateJwtToken(uuid string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"uuid": uuid,
		"exp":  time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString(deafultSecretKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func VerifyJwtToken(tokenString string, customKey ...[]byte) error {
	secretKey := deafultSecretKey
	if len(customKey) > 0 {
		if len(customKey[0]) < 32 {
			return errors.New("provided key is too short, minimum length is 32 bytes")
		}
		secretKey = customKey[0]
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}

		return secretKey, nil
	})

	if err != nil {
		return err
	}

	if !token.Valid {
		return jwt.ErrSignatureInvalid
	}

	return nil
}
