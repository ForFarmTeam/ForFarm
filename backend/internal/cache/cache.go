package cache

import "time"

type Cache interface {
	Get(key string) (interface{}, bool)
	Set(key string, value interface{}, ttl time.Duration)
	Delete(key string)
}

const (
	DefaultExpiration time.Duration = 0
	NoExpiration      time.Duration = -1
)
