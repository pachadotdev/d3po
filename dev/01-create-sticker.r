library(hexSticker)

library(ggplot2)

p <- ggplot(aes(x = mpg, y = wt), data = mtcars) + geom_point()
p <- p + theme_void() + theme_transparent()

sticker(p, package="d3po", p_size=20, s_x=1, s_y=.75, s_width=1.3, s_height=1,
        filename="inst/rstudio/templates/project/d3po_small.png")
