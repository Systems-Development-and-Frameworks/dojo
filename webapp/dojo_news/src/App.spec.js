import {shallowMount} from '@vue/test-utils';
import '@testing-library/jest-dom'
import App from "./App";
import 'regenerator-runtime';
import Vue from "vue";

describe("News List", () => {
    it('does not render any items on an initially empty list of NewsItems', () => {
        const wrapper = shallowMount(App, {
            propsData: {
                initialNewsListItems: []
            }
        });
        expect(wrapper.find("#newslist").element).toBeEmptyDOMElement();
    });

    it('renders items on an initially filled list of NewsItems', () => {
        const wrapper = shallowMount(App, {
            propsData: {
                initialNewsListItems: [
                    {id: 0, title: "macOS", votes: 0},
                    {id: 1, title: "Linux", votes: 0},
                    {id: 2, title: "Windows", votes: 0}
                ]
            }
        });
        expect(wrapper.findAll(".newslistitem")).toHaveLength(3);
    });

    it('renders items correctly upon removing a NewsItem', async () => {
        const wrapper = shallowMount(App, {
            propsData: {
                initialNewsListItems: [
                    {id: 0, title: "macOS", votes: 0},
                ]
            }
        });
        expect(wrapper.findAll(".newslistitem")).toHaveLength(1);

        wrapper.vm.removeNewsListItem(0);

        await Vue.nextTick();

        expect(wrapper.findAll(".newslistitem")).toHaveLength(0);
    });

    it('renders items correctly upon adding a NewsItem', async () => {
        const wrapper = shallowMount(App, {
            propsData: {
                initialNewsListItems: [
                    {id: 0, title: "macOS", votes: 0},
                ]
            }
        });
        expect(wrapper.findAll(".newslistitem")).toHaveLength(1);

        wrapper.vm.createNewsListItem("Test");
        wrapper.vm.createNewsListItem("Test2");

        await Vue.nextTick();

        expect(wrapper.findAll(".newslistitem")).toHaveLength(3);
    });
});

describe("List Empty Message", () => {
    const listEmptyMessage = "Oh noes, the list is empty!";

    it('displays a message on an initially empty list of NewsItems', () => {
        const wrapperWithEmptyList = shallowMount(App, {
            propsData: {
                listEmptyMessage: listEmptyMessage,
                initialNewsListItems: []
            }
        });
        expect(wrapperWithEmptyList.text()).toContain(listEmptyMessage);
    });

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

    it('is hidden upon non-empty list of NewsItems', async () => {
        const wrapperWithEmptyList = shallowMount(App, {
            propsData: {
                listEmptyMessage: listEmptyMessage,
                initialNewsListItems: []
            }
        });
        expect(wrapperWithEmptyList.text()).toContain(listEmptyMessage);

        wrapperWithEmptyList.vm.createNewsListItem("Test")

        await Vue.nextTick();

        expect(wrapperWithEmptyList.text()).not.toContain(listEmptyMessage);
    });

    it('is shown upon empty list of NewsItems', async () => {
        const wrapper = shallowMount(App, {
            propsData: {
                listEmptyMessage: listEmptyMessage,
                initialNewsListItems: [
                    {id: 0, title: "macOS", votes: 0}
                ]
            }
        });

        expect(wrapper.text()).not.toContain(listEmptyMessage);

        wrapper.vm.removeNewsListItem(0);

        await Vue.nextTick();

        expect(wrapper.html()).toContain(listEmptyMessage);
    });
});

describe("Reverse Order Button", () => {
    it('list order is reversed upon Reverse-Button click from initial state _descending_', async () => {
        const wrapper = shallowMount(App, {
            propsData: {
                initialNewsListItems: [
                    {id: 0, title: "macOS", votes: 4},
                    {id: 1, title: "Linux", votes: 8},
                    {id: 2, title: "centOS", votes: 3},
                    {id: 3, title: "Windows", votes: 0}
                ],
                initialDescendingOrder: true
            }
        });

        let expectedIdList = [1, 0, 2, 3];
        // or check HTML
        let actualIdList = wrapper.vm.sortedNewsListItems.map(x => x.id);
        expect(expectedIdList).toEqual(actualIdList);

        await wrapper.find("#reverse-order-button").trigger("click");
        expectedIdList = expectedIdList.reverse();
        actualIdList = wrapper.vm.sortedNewsListItems.map(x => x.id);
        expect(expectedIdList).toEqual(actualIdList);
    });

    it('list order is reversed upon Reverse-Button click from initial state _ascending_', async () => {
        const wrapper = shallowMount(App, {
            propsData: {
                initialNewsListItems: [
                    {id: 0, title: "macOS", votes: 4},
                    {id: 1, title: "Linux", votes: 8},
                    {id: 2, title: "centOS", votes: 3},
                    {id: 3, title: "Windows", votes: 0}
                ],
                initialDescendingOrder: false
            }
        });

        let expectedIdList = [3, 2, 0, 1];
        let actualIdList = wrapper.vm.sortedNewsListItems.map(x => x.id);
        expect(expectedIdList).toEqual(actualIdList);

        await wrapper.find("#reverse-order-button").trigger("click");
        expectedIdList = expectedIdList.reverse();
        actualIdList = wrapper.vm.sortedNewsListItems.map(x => x.id);
        expect(expectedIdList).toEqual(actualIdList);
    });

    it('displays the Reverse-Order-Button on an initially non empty list of NewsItems', () => {
        const wrapper = shallowMount(App, {
            propsData: {
                initialNewsListItems: [
                    {id: 0, title: "macOS", votes: 0},
                    {id: 1, title: "Linux", votes: 0},
                    {id: 2, title: "Windows", votes: 0}
                ]
            }
        });

        expect(wrapper.find("#reverse-order-button").element.hasAttribute("disabled")).toBeFalsy();
    });

    it('does not display the Reverse-Order-Button on an initially empty list of NewsItems', () => {
        const wrapperWithEmptyList = shallowMount(App, {
            propsData: {
                initialNewsListItems: []
            }
        });

        expect(wrapperWithEmptyList.find("#reverse-order-button").element.hasAttribute("disabled")).toBeTruthy();
        expect(wrapperWithEmptyList.find("#reverse-order-button").attributes("disabled")).toEqual("disabled");
    });

    it('Reverse-Button is hidden upon empty list', async () => {
        const wrapper = shallowMount(App, {
            propsData: {
                initialNewsListItems: [
                    {id: 0, title: "macOS", votes: 0},
                    {id: 1, title: "Linux", votes: 0},
                    {id: 2, title: "Windows", votes: 0}
                ]
            }
        });
        expect(wrapper.find("#reverse-order-button").element.hasAttribute("disabled")).not.toBeTruthy();
        expect(wrapper.find("#reverse-order-button").element.getAttribute("disabled")).not.toEqual("disabled");

        wrapper.vm.removeNewsListItem(0);
        wrapper.vm.removeNewsListItem(1);
        wrapper.vm.removeNewsListItem(2);
        await Vue.nextTick();

        expect(wrapper.find("#reverse-order-button").element.hasAttribute("disabled")).toBeTruthy();
        expect(wrapper.find("#reverse-order-button").element.getAttribute("disabled")).toEqual("disabled");
    });

    it('Reverse-Button shows up again upon non-empty list', async () => {
        const wrapperWithEmptyList = shallowMount(App, {
            propsData: {
                initialNewsListItems: []
            }
        });
        expect(wrapperWithEmptyList.find("#reverse-order-button").element.hasAttribute("disabled")).toBeTruthy();
        expect(wrapperWithEmptyList.find("#reverse-order-button").element.getAttribute("disabled")).toEqual("disabled");

        wrapperWithEmptyList.vm.createNewsListItem("Test");
        await Vue.nextTick();

        expect(wrapperWithEmptyList.find("#reverse-order-button").element.hasAttribute("disabled")).not.toBeTruthy();
        expect(wrapperWithEmptyList.find("#reverse-order-button").element.getAttribute("disabled")).not.toEqual("disabled");
    });
});
