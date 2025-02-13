package api

import (
	"context"
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/go-chi/chi/v5"
)

type HelloWorldInput struct {
	MyHeader string `header:"Authorization" required:"true" example:"Bearer token"`
}

type HelloWorldOutput struct {
	Body struct {
		Message string `json:"message" example:"hello world"`
	}
}

func (a *api) registerHelloRoutes(_ chi.Router, api huma.API) {
	tags := []string{"hello"}

	huma.Register(api, huma.Operation{
		OperationID: "helloWorld",
		Method:      http.MethodPost,
		Path:        "/hello",
		Tags:        tags,
		Summary:     "Get hello world message",
		Description: "Returns a simple hello world message",
	}, a.helloWorldHandler)
}

func (a *api) helloWorldHandler(ctx context.Context, input *HelloWorldInput) (*HelloWorldOutput, error) {
	resp := &HelloWorldOutput{}
	resp.Body.Message = "hello world from forfarm"
	return resp, nil
}
