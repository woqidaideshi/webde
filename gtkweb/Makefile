APP = demo-webde
src = one-window.c

$(APP) :
	@echo 'Compiling...'	
	@gcc $(src) -o $(APP) `pkg-config --cflags --libs webkitgtk-3.0`
	@echo 'Build APP successfully!!'

clean :
	@rm $(APP) >> /dev/null
