# I DON'T KNOW HOW TO WRITE BASH PLEASE HELP ME

COLORTERM=truecolor # This doesn't work too well with network lag,
                    # but you can't see shit without it
                    # todo: convert freerobux.win to use ansi256?

for file in frames_png/*.png
do
	directory_trimmed=${file##*/}
	viu $file -h 15 > frames_txt/${directory_trimmed%%.*}.txt
done
