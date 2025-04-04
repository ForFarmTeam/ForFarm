package main

import (
	"fmt"
	"net/http"
	"sync"
	"time"
)

type Metrics struct {
	mu        sync.Mutex
	successes int
	failures  int
	times     []time.Duration
}

func (m *Metrics) AddResult(success bool, duration time.Duration) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if success {
		m.successes++
	} else {
		m.failures++
	}
	m.times = append(m.times, duration)
}

func (m *Metrics) PrintSummary(total int) {
	var totalTime time.Duration
	var min, max time.Duration

	if len(m.times) > 0 {
		min = m.times[0]
		max = m.times[0]
	}

	for _, t := range m.times {
		totalTime += t
		if t < min {
			min = t
		}
		if t > max {
			max = t
		}
	}

	avg := time.Duration(0)
	if len(m.times) > 0 {
		avg = totalTime / time.Duration(len(m.times))
	}

	fmt.Println("---------- Load Test Summary ----------")
	fmt.Printf("Total Requests: %d\n", total)
	fmt.Printf("Success: %d | Fail: %d\n", m.successes, m.failures)
	fmt.Printf("Min Time: %v | Max Time: %v | Avg Time: %v\n", min, max, avg)
	fmt.Printf("Success rate: %.2f%%\n", float64(m.successes)/float64(total)*100)
	fmt.Println("---------------------------------------")
}

func hitEndpoint(wg *sync.WaitGroup, url string, metrics *Metrics) {
	defer wg.Done()

	req, _ := http.NewRequest("GET", url, nil)
	// req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	start := time.Now()
	resp, err := client.Do(req)
	duration := time.Since(start)

	if err != nil {
		fmt.Println("Error:", err)
		metrics.AddResult(false, duration)
		return
	}
	defer resp.Body.Close()

	success := resp.StatusCode >= 200 && resp.StatusCode < 300
	metrics.AddResult(success, duration)
}

func main() {
	baseURL := "http://localhost:8000/inventory/status"
	concurrentUsers := 1000

	var wg sync.WaitGroup
	metrics := &Metrics{}

	for i := 0; i < concurrentUsers; i++ {
		wg.Add(1)
		go hitEndpoint(&wg, baseURL, metrics)
	}

	wg.Wait()
	metrics.PrintSummary(concurrentUsers)
}
