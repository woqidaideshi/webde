#include <gtk/gtk.h>
#include <gio/gio.h>
#include <JavaScriptCore/JavaScript.h>
#include <webkit/webkit.h>
#include <gdk/gdk.h>
#include <gdk/gdkx.h>
#include <gdk/gdkkeysyms.h>
#include <X11/Xatom.h>
#include <X11/Xlib.h>

#include <stdio.h>
#include <stdlib.h>
#include <assert.h>

#define URL "file:///home/lgy/workspace/program-webkitgtk/test/index.html"

//Define JS Object myself

//hook functions
void ccore_Initialize(JSContextRef ctx, JSObjectRef object) {}

void ccore_Finalize(JSObjectRef object) {}

JSValueRef ccore_GetVerbose(JSContextRef ctx
		, JSObjectRef object
		, JSStringRef propertyName
		, JSValueRef *exception) {
	return JSValueMakeBoolean(ctx, false);
}

//print some info in console
JSValueRef ccore_Print(JSContextRef ctx
		, JSObjectRef function
		, JSObjectRef thisObject
		, size_t argumentCount
		, const JSValueRef arguments[]
		, JSValueRef *exception) {
	JSStringRef str = JSValueToStringCopy(ctx, arguments[0], exception);
	size_t size = JSStringGetMaximumUTF8CStringSize(str);
	char *utf8 = (char *)malloc(sizeof(char) * size);
	
	JSStringGetUTF8CString(str, utf8, size);
	
	fprintf(stderr, "utf8 = %s(%u)\n", utf8, size);

	free(utf8);

	return JSValueMakeNull(ctx);
}

//show some info in a GTK dialog
JSValueRef ccore_Show(JSContextRef ctx
		, JSObjectRef function
		, JSObjectRef thisObject
		, size_t argumentCount
		, const JSValueRef arguments[]
		, JSValueRef *exception) {
	JSStringRef str = JSValueToStringCopy(ctx, arguments[0], exception);
	size_t size = JSStringGetMaximumUTF8CStringSize(str);
	char *utf8 = (void *)malloc(size * sizeof(char));

	JSStringGetUTF8CString(str, utf8, size);

	GtkWidget *wgt = gtk_message_dialog_new(NULL, GTK_DIALOG_MODAL
			, GTK_MESSAGE_INFO, GTK_BUTTONS_OK, "%s", utf8);

	gtk_dialog_run(GTK_DIALOG(wgt));
	gtk_widget_destroy(wgt);
	
	free(utf8);

	return JSValueMakeNull(ctx);
}

//launch a app
JSValueRef Ccore_LaunchApp(JSContextRef ctx
		, JSObjectRef function
		, JSObjectRef thisObject
		, size_t argumentCount
		, const JSValueRef arguments[]
		, JSValueRef *exception) {
	JSStringRef str = JSValueToStringCopy(ctx, arguments[0], exception);
	size_t size = JSStringGetMaximumUTF8CStringSize(str);
	char *utf8 = (void *)malloc(size * sizeof(char));

	JSStringGetUTF8CString(str, utf8, size);
	/*
	GFile *file = g_file_new_for_path(utf8);
	GFileInputStream *fRead = g_file_read(file, NULL, NULL);
	if(fRead == NULL) {
		printf("Can't open this file");
		return JSValueMakeBoolean(ctx, false);
	}

	if(G_IS_APP_INFO(file)) {
		GAppInfo *app = file;
	} else {
		return JSValueMakeBoolean(ctx, false);
	}
	*/
	
	GAppInfo *app = (GAppInfo *)g_desktop_app_info_new_from_filename(utf8);
	GdkAppLaunchContext *launchContext = gdk_display_get_app_launch_context(gdk_display_get_default());
	gdk_app_launch_context_set_screen(launchContext, gdk_screen_get_default());
	gdk_app_launch_context_set_icon(launchContext, g_app_info_get_icon(app));
	gboolean ret = g_app_info_launch(app, NULL, (GAppLaunchContext *)launchContext, NULL);
	g_object_unref(launchContext);
	
	return JSValueMakeBoolean(ctx, true);
}

//Add an Class named as Ccore in WebkitGTK
JSClassRef Ccore_ClassCreate(JSContextRef ctx) {
	static JSClassRef ccoreClass = NULL;
	if(ccoreClass) {
		return ccoreClass;
	}

	JSStaticFunction ccoreStaticFunctions[] = {
		//{"method name", hook method, attribute}
		{"print", ccore_Print, kJSPropertyAttributeNone},
		{"show", ccore_Show, kJSPropertyAttributeNone},
		{"launchApp", Ccore_LaunchApp, kJSPropertyAttributeReadOnly},
		{NULL, 0, 0}
	};

	JSStaticValue ccoreStaticValues[] = {
		//{"attribute name", hook method, unknown, attributes}
		{"Verbose", ccore_GetVerbose, NULL, kJSPropertyAttributeDontDelete | kJSPropertyAttributeReadOnly},
		{NULL, 0, 0, 0}
	};

	/*
	 * The definition of JSClassDefinition in JSObjectRef.h: 
	 *
	 * typedef struct {
			int                                 version; // current (and only) version is 0 
		  JSClassAttributes                   attributes;
	
			const char*                         className;
			JSClassRef                          parentClass;
			    
			const JSStaticValue*                staticValues;
			const JSStaticFunction*             staticFunctions;
			
			JSObjectInitializeCallback          initialize;
			JSObjectFinalizeCallback            finalize;
			JSObjectHasPropertyCallback         hasProperty;
			JSObjectGetPropertyCallback         getProperty;
			JSObjectSetPropertyCallback         setProperty;
			JSObjectDeletePropertyCallback      deleteProperty;
			JSObjectGetPropertyNamesCallback    getPropertyNames;
			JSObjectCallAsFunctionCallback      callAsFunction;
			JSObjectCallAsConstructorCallback   callAsConstructor;
			JSObjectHasInstanceCallback         hasInstance;
			JSObjectConvertToTypeCallback       convertToType;
		} JSClassDefinition;
	 * */

	JSClassDefinition classdef = kJSClassDefinitionEmpty;
	classdef.className = "Ccore";
	classdef.initialize = ccore_Initialize;
	classdef.finalize = ccore_Finalize;
	classdef.staticValues = ccoreStaticValues;
	classdef.staticFunctions = ccoreStaticFunctions;

	return ccoreClass = JSClassCreate(&classdef);
}

//Handle the window-object-cleared singal
void ccore_WindowObjectClearedCB(WebKitWebView *view
		, WebKitWebFrame *frame
		, gpointer ctx
		, gpointer arg3
		, gpointer user_data) {
	JSStringRef className = JSStringCreateWithUTF8CString("Ccore");
	assert(className != NULL);
	JSObjectRef classObj = JSObjectMake(ctx, Ccore_ClassCreate(ctx), NULL);
	JSObjectSetProperty(ctx, JSContextGetGlobalObject(ctx), className, classObj
			, kJSPropertyAttributeNone, NULL);

	if(className != NULL) JSStringRelease(className);
}

//Show the main webpage to be desktop

static void destroyWindowCb(GtkWidget *widget, GtkWidget *window) {
	gtk_main_quit();
}

static gboolean closeWebViewCb(WebKitWebView *webView, GtkWidget *window) {
	gtk_widget_destroy(window);
	return TRUE;
}

static gboolean preventWindowExitCb(GtkWidget *w, GdkEvent *e) {
	return true;
}

static gboolean webViewCtxMenuCb(WebKitWebView *webView
		, GtkWidget *context_menu
		, WebKitHitTestResult *hit_test_result
		, gboolean triggered_with_keyboard
		, gpointer user_data) {
	return true;
}

int main(int argc, char *argv[]) {
	gtk_init(&argc, &argv);

	//get a screen
	GdkScreen *screen = gdk_screen_get_default();
	gint width = gdk_screen_get_width(screen);
	gint height = gdk_screen_get_height(screen);
	printf("screen width: %d, height: %d\n", width, height);
	
	//get a visual
	GdkVisual *visual = gdk_screen_get_rgba_visual(screen);
	if(!visual) visual = gdk_screen_get_system_visual(screen);
	
	//a window instance
	GtkWidget *main_window = gtk_window_new(GTK_WINDOW_TOPLEVEL);
	
	//set some property
	gtk_widget_set_visual(main_window, visual);
	gtk_window_set_position(GTK_WINDOW(main_window), GTK_WIN_POS_CENTER);
	gtk_window_set_default_size(GTK_WINDOW(main_window), width, height);
	//set window no other decoration
	gtk_window_set_decorated(GTK_WINDOW(main_window), FALSE);

	//a browser instance
	WebKitWebView *webView = WEBKIT_WEB_VIEW(webkit_web_view_new());

	//a scrollable area, and put a browser instance into it
	/*
	GtkWidget *scrolledWindow = gtk_scrolled_window_new(NULL, NULL);
	gtk_scrolled_window_set_policy(GTK_SCROLLED_WINDOW(scrolledWindow)
			, GTK_POLICY_AUTOMATIC
			, GTK_POLICY_AUTOMATIC);
	gtk_container_add(GTK_CONTAINER(scrolledWindow), GTK_WIDGET(webView));
	*/

	g_signal_connect(main_window, "destroy", G_CALLBACK(destroyWindowCb), NULL);
	g_signal_connect(webView, "close-web-view", G_CALLBACK(closeWebViewCb), main_window);
	g_signal_connect(G_OBJECT(webView), "window-object-cleared"
			, G_CALLBACK(ccore_WindowObjectClearedCB), webView);
	g_signal_connect(main_window, "delete-event", G_CALLBACK(preventWindowExitCb), NULL);
	g_signal_connect(webView, "context-menu", G_CALLBACK(webViewCtxMenuCb), NULL);

	//put a scrollable area into the main window
	//gtk_container_add(GTK_CONTAINER(main_window), scrolledWindow);
	gtk_container_add(GTK_CONTAINER(main_window), GTK_WIDGET(webView));

	//Load a web page into the browser intance
	webkit_web_view_load_uri(webView, URL);//"http://www.baidu.com"
	//webkit_web_view_load_html(webView, URL, NULL);
	
	//set WM_WINDOW_TYPE
	/*
	GdkAtom atom = gdk_atom_intern("_NET_WM_WINDOW_TYPE_DESKTOP", FALSE);
	gdk_property_change(gtk_widget_get_window(main_window)
			, gdk_atom_intern("_NET_WM_WINDOW_TYPE", FALSE)
			//, gdk_x11_xatom_to_atom(XA_ATOM)
			, gdk_atom_intern("ATOM", FALSE)
			, 32
			, GDK_PROP_MODE_REPLACE
			, (guchar *)&atom
			, 1);
	*/
	gtk_window_set_type_hint(GTK_WINDOW(main_window), GDK_WINDOW_TYPE_HINT_DESKTOP);
	//gtk_widget_grab_focus(GTK_WIDGET(webView));

	gtk_widget_show_all(main_window);

	//set the background's color to black
	GdkRGBA rgba = {0, 0, 0, 0.0};
	gdk_window_set_background_rgba(gtk_widget_get_window(main_window), &rgba);

	gtk_main();

	return 0;
}
