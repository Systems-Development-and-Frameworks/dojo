import {shallowMount} from '@vue/test-utils';
import App from "./App";
import 'regenerator-runtime';
import Vue from "vue";

const listEmptyMessage = "Oh noes, the list is empty!";

it('displays a message on an initially empty list of NewsItems', () => {
    const wrapperWithNonEmptyList = shallowMount(App, {
        propsData: {
            listEmptyMessage: listEmptyMessage,
            initialNewsListItems: []
        }
    });
    expect(wrapperWithNonEmptyList.text()).toContain(listEmptyMessage);
})

it('displays no message on an initially non-empty list of NewsItems', () => {
    const wrapper = shallowMount(App, {
        propsData: {
            listEmptyMessage: listEmptyMessage,
            initialNewsListItems: [
                {id: 0, title: "macOS", votes: 0},
                {id: 1, title: "Linux", votes: 0},
                {id: 2, title: "Windows", votes: 0}
            ]
        }
    });

    expect(wrapper.text()).not.toContain(listEmptyMessage);
});

it('adds and removes the message on list mutations', async () => {
    const wrapper = shallowMount(App, {
        propsData: {
            listEmptyMessage: listEmptyMessage,
            initialNewsListItems: []
        }
    });

    expect(wrapper.text()).toContain(listEmptyMessage);

    // alternatively, call .vm.$emit
    wrapper.vm.createNewsListItem("Test")

    await Vue.nextTick();

    expect(wrapper.text()).not.toContain(listEmptyMessage);

    // alternatively, call .vm.$emit
    wrapper.vm.removeNewsListItem(0);

    await Vue.nextTick();

    expect(wrapper.html()).toContain(listEmptyMessage);
});
