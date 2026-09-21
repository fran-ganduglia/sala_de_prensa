(function () {
  var CMS = window.CMS;
  var h = window.h;
  var createClass = window.createClass;
  if (!CMS || !h || !createClass) return;

  CMS.registerPreviewStyle('preview.css');

  function value(entry, key, fallback) {
    var item = entry.getIn(['data', key]);
    return item === undefined || item === null || item === '' ? fallback : String(item);
  }

  function object(entry, key) {
    var item = entry.getIn(['data', key]);
    return item && item.toJS ? item.toJS() : {};
  }

  function list(entry, key, fallback) {
    var item = entry.getIn(['data', key]);
    var items = item && item.toJS ? item.toJS() : item;
    return Array.isArray(items) ? items : (fallback || []);
  }

  function assetUrl(component, path) {
    try {
      var asset = path && component.props.getAsset(path);
      return asset ? asset.toString() : '';
    } catch (error) {
      return '';
    }
  }

  function device(component) {
    return h('div', { className: 'preview-device-selector', role: 'group', 'aria-label': 'Vista previa' },
      h('button', { className: component.state.device === 'desktop' ? 'is-active' : '', onClick: function () { component.setState({ device: 'desktop' }); } }, 'Escritorio'),
      h('button', { className: component.state.device === 'mobile' ? 'is-active' : '', onClick: function () { component.setState({ device: 'mobile' }); } }, 'Móvil')
    );
  }

  var Preview = createClass({
    getInitialState: function () { return { device: 'desktop' }; },
    render: function () {
      var entry = this.props.entry;
      var placement = object(entry, 'placement');
      var classification = object(entry, 'classification');
      var media = object(entry, 'media');
      var primarySection = value(entry, 'primarySection', classification.primarySection || 'ACTUALIDAD');
      var title = value(entry, 'title', 'Titular de la noticia');
      var summary = value(entry, 'summary', 'La bajada aparecerá aquí si la cargás.');
      var publishedAt = value(entry, 'publishedAt', 'Fecha y hora de publicación');
      var image = assetUrl(this, value(entry, 'image', media.image || ''));
      var imageCredit = value(entry, 'imageCredit', media.imageCredit || '');
      var gallery = list(entry, 'gallery', media.gallery);
      var videos = list(entry, 'videos', media.videos);
      var urgent = entry.getIn(['data', 'urgent']) === true || placement.urgent === true;
      var body = this.props.widgetFor('body');

      return h('div', { className: 'preview-root' },
        device(this),
        h('article', { className: 'news-preview news-preview--' + this.state.device },
          h('header', { className: 'preview-header' },
            h('b', {}, 'SALA DE PRENSA'),
            h('span', {}, 'ACTUALIDAD · POLÍTICA · DEPORTES · CULTURA')
          ),
          h('nav', { className: 'preview-breadcrumb' }, 'Inicio / ', primarySection),
          h('div', { className: 'preview-kicker' },
            h('span', {}, primarySection),
            urgent && h('span', { className: 'preview-urgent' }, 'URGENTE')
          ),
          h('h1', {}, title),
          h('p', { className: 'preview-summary' }, summary),
          h('p', { className: 'preview-meta' }, publishedAt),
          image && h('figure', { className: 'preview-figure' },
            h('img', { src: image, alt: '' }),
            imageCredit && h('figcaption', {}, imageCredit)
          ),
          body ? h('div', { className: 'preview-body' }, body) : h('p', { className: 'preview-empty' }, 'El cuerpo de la noticia aparecerá aquí.'),
          gallery.length > 0 && h('section', { className: 'preview-gallery' },
            h('p', { className: 'preview-section-label' }, 'GALERÍA'),
            h('div', { className: 'preview-gallery-grid' }, gallery.map(function (item, index) {
              var galleryImage = assetUrl(this, item.image);
              return galleryImage && h('figure', { key: index }, h('img', { src: galleryImage, alt: item.caption || '' }), item.caption && h('figcaption', {}, item.caption));
            }, this))
          ),
          videos.filter(function (video) { return video.url; }).map(function (video, index) {
            return h('p', { className: 'preview-video', key: index }, '▶ ', video.caption || video.type || 'Video');
          })
        )
      );
    }
  });

  CMS.registerPreviewTemplate('news', Preview);
}());
