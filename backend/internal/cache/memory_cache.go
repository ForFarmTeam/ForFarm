package cache

import (
	"time"

	gocache "github.com/patrickmn/go-cache"
)

type memoryCache struct {
	client *gocache.Cache
}

func NewMemoryCache(defaultExpiration, cleanupInterval time.Duration) Cache {
	return &memoryCache{
		client: gocache.New(defaultExpiration, cleanupInterval),
	}
}

func (m *memoryCache) Get(key string) (interface{}, bool) {
	return m.client.Get(key)
}

func (m *memoryCache) Set(key string, value interface{}, ttl time.Duration) {
	var expiration time.Duration
	if ttl == DefaultExpiration {
		expiration = gocache.DefaultExpiration
	} else if ttl == NoExpiration {
		expiration = gocache.NoExpiration
	} else {
		expiration = ttl
	}
	m.client.Set(key, value, expiration)
}

func (m *memoryCache) Delete(key string) {
	m.client.Delete(key)
}
