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

  function collectionValue(item, key, fallback) {
    if (!item) return fallback;
    var value = item.get ? item.get(key) : item[key];
    return value === undefined || value === null ? fallback : value;
  }

  function storyFromData(slug, data) {
    return {
      slug: slug,
      title: String(collectionValue(data, 'title', 'Titular de la noticia')),
      summary: String(collectionValue(data, 'summary', '')),
      section: String(collectionValue(data, 'primarySection', 'ACTUALIDAD')),
      image: String(collectionValue(data, 'image', '')),
      imagePosition: String(collectionValue(data, 'imagePosition', '50% 50%'))
    };
  }

  function collectionStories(entries) {
    var items = entries && entries.valueSeq ? entries.valueSeq().toArray() : (entries && entries.toArray ? entries.toArray() : (Array.isArray(entries) ? entries : []));
    return items.map(function (item) {
      var data = collectionValue(item, 'data', {});
      return storyFromData('', data);
    }).filter(function (story) { return story.title; });
  }

  function previewImage(component, story, className) {
    var image = story && (assetUrl(component, story.image) || story.image);
    return image ? h('img', { className: className, src: image, alt: '', style: { objectPosition: story.imagePosition || '50% 50%' } }) : h('div', { className: className + ' homepage-preview-placeholder' });
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
      var imagePosition = value(entry, 'imagePosition', media.imagePosition || '50% 50%');
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
            h('img', { src: image, alt: '', style: { objectPosition: imagePosition } }),
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

  var HomepagePreview = createClass({
    getInitialState: function () { return { device: 'desktop', stories: [], latest: [], loading: true, error: false }; },
    selectedSlugs: function (entry) {
      var main = value(entry, 'main', '');
      var urgent = value(entry, 'urgent', '');
      var featured = list(entry, 'featured', []).map(function (item) { return item.story; });
      return [main, urgent].concat(featured).filter(Boolean).filter(function (slug, index, slugs) { return slugs.indexOf(slug) === index; });
    },
    loadStories: function () {
      var entry = this.props.entry;
      var slugs = this.selectedSlugs(entry);
      this.setState({ loading: true, error: false });
      Promise.all([
        Promise.all(slugs.map(function (slug) {
          return this.props.getCollection('news', slug).then(function (item) {
            return storyFromData(slug, collectionValue(item, 'data', {}));
          });
        }, this)),
        this.props.getCollection('news').then(collectionStories)
      ]).then(function (results) {
        this.setState({ stories: results[0], latest: results[1], loading: false });
      }.bind(this)).catch(function () {
        this.setState({ loading: false, error: true });
      }.bind(this));
    },
    componentDidMount: function () { this.loadStories(); },
    componentDidUpdate: function (previousProps) {
      if (this.selectedSlugs(previousProps.entry).join('|') !== this.selectedSlugs(this.props.entry).join('|')) this.loadStories();
    },
    render: function () {
      var entry = this.props.entry;
      var mainSlug = value(entry, 'main', '');
      var urgentSlug = value(entry, 'urgent', '');
      var featuredSlugs = list(entry, 'featured', []).map(function (item) { return item.story; }).filter(Boolean);
      var stories = this.state.stories;
      var findStory = function (slug) { return stories.filter(function (story) { return story.slug === slug; })[0]; };
      var main = findStory(mainSlug);
      var urgent = findStory(urgentSlug);
      var featured = featuredSlugs.map(findStory).filter(Boolean).filter(function (story) { return !main || story.slug !== main.slug; }).slice(0, 2);
      var latest = this.state.latest.filter(function (story) { return !main || story.title !== main.title; }).slice(0, 3);

      return h('div', { className: 'preview-root' },
        device(this),
        h('div', { className: 'homepage-preview homepage-preview--' + this.state.device },
          h('header', { className: 'homepage-preview-header' }, h('b', {}, 'SALA DE PRENSA'), h('span', {}, 'ACTUALIDAD · POLÍTICA · DEPORTES · CULTURA')),
          this.state.loading && h('p', { className: 'homepage-preview-status' }, 'Cargando las noticias para la vista previa…'),
          this.state.error && h('p', { className: 'homepage-preview-status' }, 'No pudimos cargar las noticias. Guardá y recargá el panel para reintentar.'),
          !this.state.loading && !this.state.error && h('div', {},
            urgent && h('div', { className: 'homepage-preview-urgent' }, h('b', {}, 'URGENTE'), h('span', {}, urgent.title)),
            h('div', { className: 'homepage-preview-grid' },
              main ? h('article', { className: 'homepage-preview-main' },
                previewImage(this, main, 'homepage-preview-main-image'),
                h('p', { className: 'preview-category' }, main.section),
                h('h1', {}, main.title),
                main.summary && h('p', { className: 'homepage-preview-summary' }, main.summary)
              ) : h('div', { className: 'homepage-preview-empty' }, 'Elegí una noticia principal para verla acá.'),
              h('div', { className: 'homepage-preview-featured' }, featured.length ? featured.map(function (story) {
                return h('article', { key: story.slug }, previewImage(this, story, 'homepage-preview-card-image'), h('p', { className: 'preview-category' }, story.section), h('h2', {}, story.title));
              }, this) : h('div', { className: 'homepage-preview-empty' }, 'Agregá noticias destacadas para completar este bloque.')),
              h('aside', { className: 'homepage-preview-latest' }, h('h2', {}, 'Último momento'), latest.map(function (story) { return h('p', { key: story.slug }, story.title); }))
            )
          )
        )
      );
    }
  });

  CMS.registerPreviewTemplate('homepage', HomepagePreview);
}());
