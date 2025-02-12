package api

import (
	"context"
)

type HelloworldOutput struct {
	Body struct {
		Message string `json:"message" example:"Hello, world!" doc:"Greeting message"`
	}
}

func (a *api) helloWorldHandler(ctx context.Context, input *struct{}) (*HelloworldOutput, error) {
	resp := &HelloworldOutput{}
	resp.Body.Message = "Hello, world!"
	return resp, nil
}
