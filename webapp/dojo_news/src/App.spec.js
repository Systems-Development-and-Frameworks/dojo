import {mount, shallowMount} from '@vue/test-utils';
import App from "./App";
import 'regenerator-runtime';
import Vue from "vue";

describe("List Empty Message", () => {
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

        expect(wrapper.text()).toContain("Reverse Order");
    });

    it('does not display the Reverse-Order-Button on an initially empty list of NewsItems', () => {
        const wrapperWithEmptyList = shallowMount(App, {
            propsData: {
                initialNewsListItems: []
            }
        });

        expect(wrapperWithEmptyList.text()).not.toContain("Reverse Order");
    });

    it('Reverse-Button is hidden upon empty list', async () => {
        const wrapper = mount(App, {
            propsData: {
                initialNewsListItems: [
                    {id: 0, title: "macOS", votes: 0},
                    {id: 1, title: "Linux", votes: 0},
                    {id: 2, title: "Windows", votes: 0}
                ]
            }
        });
        expect(wrapper.text()).toContain("Reverse Order");

        let buttons = wrapper.findAll("button").wrappers;
        let removeButtons = buttons.filter(x => x.text().includes("Remove"));
        for (let removeButton of removeButtons) {
            await removeButton.trigger("click");
        }
        // or we just do:
        // wrapper.vm.removeNewsListItem(0);
        // await Vue.nextTick();
        // but we don't, because the current implementation took too long to figure out

        expect(wrapper.text()).not.toContain("Reverse Order");
    });

    it('Reverse-Button shows up again upon non-empty list', async () => {
        const wrapperWithEmptyList = shallowMount(App, {
            propsData: {
                initialNewsListItems: []
            }
        });
        expect(wrapperWithEmptyList.text()).not.toContain("Reverse Order");

        wrapperWithEmptyList.vm.createNewsListItem("Test");
        await Vue.nextTick();

        expect(wrapperWithEmptyList.text()).toContain("Reverse Order");
    });
});