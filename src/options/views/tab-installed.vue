<template>
  <div class="tab-installed">
    <header class="flex">
      <div class="flex-auto">
        <dropdown :closeAfterClick="true" :class="{active: menuNewActive}" @stateChange="onStateChange">
          <tooltip :title="i18n('buttonNew')" placement="down" align="start" slot="toggle">
            <span class="btn-ghost">
              <icon name="plus"></icon>
            </span>
          </tooltip>
          <div class="dropdown-menu-item" v-text="i18n('buttonNew')" @click.prevent="newStyle"></div>
          <a class="dropdown-menu-item" v-text="i18n('installFrom', 'userstyles.org')" href="https://userstyles.org/" target="_blank"></a>
        </dropdown>
        <tooltip :title="i18n('buttonUpdateAll')" placement="down" align="start">
          <span class="btn-ghost" @click="updateAll">
            <icon name="refresh"></icon>
          </span>
        </tooltip>
      </div>
      <div class="filter-search">
        <input type="text" :placeholder="i18n('labelSearchStyle')" v-model="search">
        <icon name="search"></icon>
      </div>
    </header>
    <div class="styles">
      <item v-for="style in store.filteredStyles" :key="style.props.id"
      :styleData="style" @edit="editStyle"></item>
    </div>
    <div class="backdrop" :class="{mask: store.loading}" v-show="message">
      <div v-html="message"></div>
    </div>
    <edit v-if="style" :initial="style" @close="endEditStyle"></edit>
  </div>
</template>

<script>
import Dropdown from 'vueleton/lib/dropdown';
import Tooltip from 'vueleton/lib/tooltip';
import { i18n, sendMessage, debounce } from 'src/common';
import { objectGet } from 'src/common/object';
// import options from 'src/common/options';
import SettingCheck from 'src/common/ui/setting-check';
// import hookSetting from 'src/common/hook-setting';
import Icon from 'src/common/ui/icon';
import LocaleGroup from 'src/common/ui/locale-group';
import Item from './style-item';
import Edit from './edit';
import { store } from '../utils';

Object.assign(store, {
  filteredStyles: null,
});

export default {
  components: {
    Item,
    Edit,
    Tooltip,
    SettingCheck,
    LocaleGroup,
    Dropdown,
    Icon,
  },
  data() {
    return {
      store,
      style: null,
      search: null,
      modal: null,
      menuNewActive: false,
    };
  },
  watch: {
    search: 'updateLater',
    'store.styles': 'onUpdate',
  },
  computed: {
    message() {
      if (this.store.loading) {
        return i18n('msgLoading');
      }
      if (!this.store.styles.length) {
        return i18n('labelNoStyles');
      }
      if (!objectGet(this.store, 'filteredStyles.length')) {
        return i18n('labelNoSearchStyles');
      }
    },
  },
  methods: {
    onUpdate() {
      const { search } = this;
      const lowerSearch = (search || '').toLowerCase();
      const { styles } = this.store;
      const filteredStyles = search
        ? styles.filter(style => style.meta.name.toLowerCase().includes(lowerSearch))
        : styles.slice();
      this.store.filteredStyles = filteredStyles;
    },
    updateLater() {
      this.debouncedUpdate();
    },
    newStyle() {
      this.style = {};
    },
    updateAll() {
      sendMessage({ cmd: 'CheckUpdateAll' });
    },
    editStyle(id) {
      this.style = this.store.styles.find(style => style.props.id === id);
    },
    endEditStyle() {
      this.style = null;
    },
    onStateChange(active) {
      this.menuNewActive = active;
    },
  },
  created() {
    this.debouncedUpdate = debounce(this.onUpdate, 200);
    this.onUpdate();
  },
};
</script>

<style>
$header-height: 4rem;

.tab-installed {
  padding: 0;
  > header {
    height: $header-height;
    align-items: center;
    padding: 0 1rem;
    line-height: 1;
    border-bottom: 1px solid darkgray;
  }
  .vl-dropdown-menu {
    white-space: nowrap;
  }
}
.backdrop,
.styles {
  position: absolute;
  top: $header-height;
  left: 0;
  right: 0;
  bottom: 0;
}
.styles {
  overflow-y: auto;
}
.backdrop {
  text-align: center;
  color: gray;
}
.backdrop > *,
.backdrop::after {
  display: inline-block;
  vertical-align: middle;
  font-size: 2rem;
}
.backdrop::after {
  content: ' ';
  width: 0;
  height: 100%;
}
.mask {
  background: rgba(0,0,0,.08);
  /*transition: opacity 1s;*/
}
.dropdown-menu-item {
  display: block;
  width: 100%;
  padding: .5rem;
  text-decoration: none;
  color: #666;
  cursor: pointer;
  &:hover {
    color: inherit;
    background: #fbfbfb;
  }
}
.filter-search {
  position: relative;
  width: 12rem;
  .icon {
    position: absolute;
    height: 100%;
    top: 0;
    right: .5rem;
  }
  > input {
    padding-left: .5rem;
    padding-right: 2rem;
    line-height: 2;
  }
}
.filter-sort {
  .vl-dropdown-menu {
    padding: 1rem;
    > * {
      margin-bottom: .5rem;
    }
  }
}
</style>
