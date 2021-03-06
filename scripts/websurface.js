elation.require(['engine.things.generic'], function() {
  elation.component.add('engine.things.januswebsurface', function() {
    this.postinit = function() {
      elation.engine.things.januswebsurface.extendclass.postinit.call(this);
      this.defineProperties({
        websurface_id: { type: 'string' },
        color: { type: 'color', default: 0xffffff },
      });
      var websurface = this.room.websurfaces[this.properties.websurface_id];
      if (websurface) {
        var url = websurface.src;
        if (url && !url.match(/^(https?:)?\/\//)) {
          url = this.room.baseurl + url;
        }
        // So...it turns out this is a bad time to be doing this sort of 3d iframe hackery in the browser.
        // The internet is slowly transitioning from HTTP to HTTPS, but we're currently only at about 50%
        // encrypted.  Within the Janus community this is even lower, around 10%.  Due to browser security
        // concerns, WebVR content must be run on HTTPS since it's considered a "powerful new feature" and
        // browser developers are using this as a wedge to drive the internet towards greater adoption of
        // HTTPS.  This requirement combines with the "HTTPS sites must not load any unencrypted resources"
        // restriction to mean that we can only show WebSurfaces of HTTPS websites.

        // As a last-ditch effort, we'll try loading the page as HTTPS even if the user specified HTTP,
        // and hope that most sites are running both.

        this.url = url.replace(/^http:/, 'https:');
      }
      elation.events.add(this, 'mouseover', elation.bind(this, this.hover));
      elation.events.add(this, 'mouseout', elation.bind(this, this.unhover));
    }
    this.createObject3D = function() {
      var plane = new THREE.PlaneBufferGeometry(1,1);
      var mat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 0,
        transparent: true,
        blending: THREE.NoBlending,
        side: THREE.DoubleSide
      });
      this.material = mat;
      //plane.applyMatrix(new THREE.Matrix4().makeTranslation(.5,-.5,0));
      return new THREE.Mesh(plane, mat);
    }
    this.createObjectDOM = function() {
        var websurface = this.room.websurfaces[this.properties.websurface_id];
        if (websurface) {
          var width = websurface.width || 1024,
              height = websurface.height || 768;

          var iframe = elation.html.create('iframe');
          iframe.src = this.url;
          var div = elation.html.create('div');
          div.className = 'janusweb_websurface ';
          div.appendChild(iframe);
          div.style.width = width + 'px';
          div.style.height = height + 'px';
          iframe.style.width = width + 'px';
          iframe.style.height = height + 'px';

          var obj = new THREE.CSS3DObject(div);
          obj.scale.set(1/width, 1/height, 1);

          this.iframe = iframe;
          this.domobj = obj;
        }
    }
    this.hover = function() {
      this.material.color.setHex(0xff0000);
    }
    this.unhover = function() {
      this.material.color.setHex(0x000000);
    }
    this.start = function() {
      this.objects['3d'].add(this.domobj);
    }
    this.stop = function() {
      this.objects['3d'].remove(this.domobj);
    }
  }, elation.engine.things.janusbase);
});

