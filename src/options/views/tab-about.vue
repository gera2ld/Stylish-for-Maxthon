<template>
  <div>
    <h1>
      <span v-text="i18n('labelAbout')"></span>
      <small v-text="`v${version}`"></small>
    </h1>
    <p class="mb-2" v-text="i18n('extDescription')"></p>
    <div class="mb-2">
      <label v-text="i18n('labelRelated')"></label>
      <a href="https://github.com/gera2ld/stylish-mx/wiki" target="_blank" v-text="i18n('extName')"></a> |
      <a href="https://github.com/gera2ld/stylish-mx/issues" target="_blank" v-text="i18n('labelFeedback')"></a>
    </div>
    <div class="mb-2">
      <label v-text="i18n('labelAuthor')"></label>
      <span v-html="i18n('anchorAuthor')"></span>
    </div>
    <div class="mb-2">
      <label v-text="i18n('labelTranslator')"></label>
      <span v-html="i18n('anchorTranslator')"></span>
    </div>
    <div class="mb-2">
      <label v-text="i18n('labelCurrentLang')"></label>
      <span id="currentLang" v-text="language"></span> |
      <a href="https://github.com/gera2ld/stylish-mx/wiki/i18n" target="_blank">
        Help with translation
      </a>
    </div>
  </div>
</template>

<script>
const data = {
  version: browser.runtime.getManifest().version,
  language: navigator.language,
};

export default {
  data() {
    return data;
  },
};
</script>
