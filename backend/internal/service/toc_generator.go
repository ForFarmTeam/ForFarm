package service

import (
	"github.com/forfarm/backend/internal/domain"
	"regexp"
	"strings"
)

type TOCGenerator struct{}

func NewTOCGenerator() *TOCGenerator {
	return &TOCGenerator{}
}

func (g *TOCGenerator) GenerateFromContent(content string) []domain.TableOfContent {
	var toc []domain.TableOfContent
	lines := strings.Split(content, "\n")
	order := 0

	headerRegex := regexp.MustCompile(`^(#{1,6})\s+(.*)$`)

	for _, line := range lines {
		if matches := headerRegex.FindStringSubmatch(line); matches != nil {
			order++
			level := len(matches[1]) // Number of # indicates level
			title := matches[2]

			toc = append(toc, domain.TableOfContent{
				Title: title,
				Level: level,
				Order: order,
			})
		}
	}

	return toc
}
