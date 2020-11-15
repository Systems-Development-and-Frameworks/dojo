import {shallowMount} from '@vue/test-utils';
import '@testing-library/jest-dom'
import App from "./App";
import 'regenerator-runtime';
import Vue from "vue";

describe("News List", () => {
    it('renders items, given initially set items', () => {
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

    it('doesn\'t render items, given an empty initial list of items, ', () => {
        const wrapper = shallowMount(App, {
            propsData: {
                initialNewsListItems: []
            }
        });
        expect(wrapper.find("#newslist").element).toBeEmptyDOMElement();
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
    it('appears on an initially empty list of NewsItems', () => {
        const wrapperWithEmptyList = shallowMount(App, {
            propsData: {
                initialNewsListItems: []
            }
        });
        expect(wrapperWithEmptyList.text()).toContain("The list is empty :(");
    });

    it('doesn\'t appear on an initially non-empty list of NewsItems', () => {
        const wrapper = shallowMount(App, {
            propsData: {
                initialNewsListItems: [
                    {id: 0, title: "macOS", votes: 0},
                    {id: 1, title: "Linux", votes: 0},
                    {id: 2, title: "Windows", votes: 0}
                ]
            }
        });

        expect(wrapper.text()).not.toContain("The list is empty :(");
    });

    it('is hidden upon non-empty list of NewsItems', async () => {
        const wrapperWithEmptyList = shallowMount(App, {
            propsData: {
                initialNewsListItems: []
            }
        });
        expect(wrapperWithEmptyList.text()).toContain("The list is empty :(");

        wrapperWithEmptyList.vm.createNewsListItem("Test")

        await Vue.nextTick();

        expect(wrapperWithEmptyList.text()).not.toContain("The list is empty :(");
    });

    it('is shown upon empty list of NewsItems', async () => {
        const wrapper = shallowMount(App, {
            propsData: {
                initialNewsListItems: [
                    {id: 0, title: "macOS", votes: 0}
                ]
            }
        });

        expect(wrapper.text()).not.toContain("The list is empty :(");

        wrapper.vm.removeNewsListItem(0);

        await Vue.nextTick();

        expect(wrapper.html()).toContain("The list is empty :(");
    });
});

describe("Reverse Order Button", () => {
    it('reverses list order upon click from initial state _descending_', async () => {
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

    it('reverses list order upon click from initial state _ascending_', async () => {
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

    it('is not disabled on an initially non-empty list of NewsItems', () => {
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

    it('is disabled on an initially empty list of NewsItems', () => {
        const wrapperWithEmptyList = shallowMount(App, {
            propsData: {
                initialNewsListItems: []
            }
        });

        expect(wrapperWithEmptyList.find("#reverse-order-button").element.hasAttribute("disabled")).toBeTruthy();
        expect(wrapperWithEmptyList.find("#reverse-order-button").attributes("disabled")).toEqual("disabled");
    });

    it('is hidden upon empty list', async () => {
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

    it('shows up again upon non-empty list', async () => {
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
