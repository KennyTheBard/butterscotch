package main

import (
	. "github.com/kennythebard/kromatique/convert"
	. "github.com/kennythebard/kromatique/effect"
	. "github.com/kennythebard/kromatique/histogram"
	. "github.com/kennythebard/kromatique/imageio"
	. "github.com/kennythebard/kromatique/morphing"
	. "github.com/kennythebard/kromatique/strategy"
	. "github.com/kennythebard/kromatique/utils"

	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image"
	"image/gif"
	"image/png"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"golang.org/x/image/draw"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

type pair struct {
	StartX float64 `json:"StartX"`
	EndX   float64 `json:"EndX"`
	StartY float64 `json:"StartY"`
	EndY   float64 `json:"EndY"`
}

func main() {

	router := gin.Default()
	router.Use(CORSMiddleware())
	router.POST("/morph", func(c *gin.Context) {
		form, _ := c.MultipartForm()

		file, _ := form.File["srcImg"][0].Open()
		img1, _, _ := image.Decode(file)

		file, _ = form.File["dstImg"][0].Open()
		img2, _, _ := image.Decode(file)

		encodedPairs, _ := form.Value["pairs"]
		var decodedPairs []pair
		if err := json.Unmarshal([]byte("["+encodedPairs[0]+"]"), &decodedPairs); err != nil {
			fmt.Println(err)
		}

		srcPoints := make([]Vertex, 0)
		dstPoints := make([]Vertex, 0)
		for _, p := range decodedPairs {
			srcPoints = append(srcPoints, Vertex{
				X: p.StartX,
				Y: p.StartY,
			})

			dstPoints = append(dstPoints, Vertex{
				X: p.EndX,
				Y: p.EndY,
			})
		}

		imgs := Morph(img1, img2, srcPoints, dstPoints, 12)

		delays := make([]int, len(imgs))
		for i := range delays {
			delays[i] = 20
		}
		result, _ := ImageToGif(imgs, delays, 256)
		buf := new(bytes.Buffer)
		if err := gif.EncodeAll(buf, result); err != nil {
			fmt.Println(err)
		}

		Save(result, "../resources/result", "gif")

		b64result := base64.StdEncoding.EncodeToString(buf.Bytes())
		c.Set("Content-Type", "image/gif")
		c.String(http.StatusOK, b64result)
	})
	router.POST("/filter", func(c *gin.Context) {
		form, _ := c.MultipartForm()

		file, _ := form.File["img"][0].Open()
		img, _, _ := image.Decode(file)

		kernel := form.Value["kernel"][0]

		switch kernel {
		case "BoxBlur3x3":
			img = Convolution(Extend, BoxBlurKernel(1))(img)
			break
		case "BoxBlur5x5":
			img = Convolution(Extend, BoxBlurKernel(2))(img)
			break
		case "Sobel":
			img = MultiConvolution(Extend, SobelMerge, SobelKernels()...)(img)
		}

		buf := new(bytes.Buffer)
		if err := png.Encode(buf, img.(image.Image)); err != nil {
			fmt.Println(err)
		}

		b64result := base64.StdEncoding.EncodeToString(buf.Bytes())
		c.Set("Content-Type", "image/png")
		c.String(http.StatusOK, b64result)
	})
	router.POST("/mapping", func(c *gin.Context) {
		form, _ := c.MultipartForm()

		file, _ := form.File["img"][0].Open()
		img, _, _ := image.Decode(file)

		mappingRule := form.Value["mappingRule"][0]

		switch mappingRule {
		case "Grayscale":
			img = Adjust(Grayscale)(img)
			break
		case "Sepia":
			img = Adjust(Sepia)(img)
			break
		case "Negative":
			img = Adjust(Negative)(img)
		}

		buf := new(bytes.Buffer)
		if err := png.Encode(buf, img.(image.Image)); err != nil {
			fmt.Println(err)
		}

		b64result := base64.StdEncoding.EncodeToString(buf.Bytes())
		c.Set("Content-Type", "image/png")
		c.String(http.StatusOK, b64result)
	})
	router.POST("/colorPalette", func(c *gin.Context) {
		form, _ := c.MultipartForm()

		file, _ := form.File["img"][0].Open()
		img, _, _ := image.Decode(file)

		paletteSize, _ := strconv.Atoi(form.Value["paletteSize"][0])

		aux := image.NewPaletted(img.Bounds(), GeneratePallet(img, paletteSize))
		draw.Draw(aux, aux.Rect, img, img.Bounds().Min, draw.Over)
		img = aux

		buf := new(bytes.Buffer)
		if err := png.Encode(buf, img.(image.Image)); err != nil {
			fmt.Println(err)
		}

		b64result := base64.StdEncoding.EncodeToString(buf.Bytes())
		c.Set("Content-Type", "image/png")
		c.String(http.StatusOK, b64result)
	})
	router.POST("/equalize", func(c *gin.Context) {
		form, _ := c.MultipartForm()

		file, _ := form.File["img"][0].Open()
		img, _, _ := image.Decode(file)

		img = NewImageHistogram(img, LightnessEval).Equalize(LightnessCorrection)

		buf := new(bytes.Buffer)
		if err := png.Encode(buf, img.(image.Image)); err != nil {
			fmt.Println(err)
		}

		b64result := base64.StdEncoding.EncodeToString(buf.Bytes())
		c.Set("Content-Type", "image/png")
		c.String(http.StatusOK, b64result)
	})

	router.Run(":8080")
}
