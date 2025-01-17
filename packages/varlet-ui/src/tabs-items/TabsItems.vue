<template>
  <var-swipe :class="n()" ref="swipe" :loop="loop" :touchable="canSwipe" :indicator="false" @change="handleSwipeChange">
    <slot />
  </var-swipe>
</template>

<script lang="ts">
import VarSwipe from '../swipe'
import { defineComponent, watch, ref, computed, type Ref, type ComputedRef } from 'vue'
import { call, createNamespace } from '../utils/components'
import { props } from './props'
import { useTabItem, type TabsItemsProvider } from './provide'
import { doubleRaf } from '../utils/elements'
import { type TabItemProvider } from '../tab-item/provide'

const { n } = createNamespace('tabs-items')

export default defineComponent({
  name: 'VarTabsItems',
  components: { VarSwipe },
  props,
  setup(props) {
    const swipe: Ref<null | typeof VarSwipe> = ref(null)
    const active: ComputedRef<number | string> = computed(() => props.active)
    const { tabItemList, bindTabItem, length } = useTabItem()

    const matchName = (active: number | string | undefined): TabItemProvider | undefined => {
      return tabItemList.find(({ name }: TabItemProvider) => active === name.value)
    }

    const matchIndex = (active: number | string | undefined): TabItemProvider | undefined => {
      return tabItemList.find(({ index }: TabItemProvider) => active === index.value)
    }

    const matchActive = (active: number | string | undefined): TabItemProvider | undefined => {
      return matchName(active) || matchIndex(active)
    }

    const handleActiveChange = (newValue: number | string | undefined) => {
      const newActiveTabItemProvider: TabItemProvider | undefined = matchActive(newValue)
      if (!newActiveTabItemProvider) {
        return
      }

      swipe.value?.to(newActiveTabItemProvider.index.value)
    }

    const handleSwipeChange = (currentIndex: number) => {
      const tabItem = tabItemList.find(({ index }) => index.value === currentIndex) as TabItemProvider
      const active = tabItem.name.value ?? tabItem.index.value

      call(props['onUpdate:active'], active)
    }

    // expose
    const getSwipe = () => {
      return swipe.value
    }

    const tabsItemsProvider: TabsItemsProvider = {
      active,
    }

    bindTabItem(tabsItemsProvider)

    watch(() => props.active, handleActiveChange)

    watch(
      () => length.value,
      async () => {
        await doubleRaf()
        handleActiveChange(props.active)
      }
    )

    return {
      swipe,
      n,
      handleSwipeChange,
      getSwipe,
    }
  },
})
</script>

<style lang="less">
@import '../styles/common';
@import '../swipe/swipe';
</style>
