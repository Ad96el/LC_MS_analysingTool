import sys
from app.main import create_app
import pytest
from waitress import serve


if __name__ == '__main__':

    if len(sys.argv) == 2:
        if(sys.argv[1] == "development"):
            app = create_app("development")
            app.run(threaded=True)

        elif (sys.argv[1] == "production"):
            app = create_app("production")
            serve(app, port=4000, host="0.0.0.0", threads=8)

        elif (sys.argv[1] == "testing"):
            pytest.main(["-x", "app/test"])
    else:
        app = create_app("development")
        app.run(threaded=True, port=5000)
