import {shallowMount} from '@vue/test-utils';
import App from "./App";

test('display message only on empty list', () => {
    const listEmptyMessage = "Oh noes, the list is empty!";

    const wrapperWithNonEmptyList = shallowMount(App, {
        propsData: {
            listEmptyMessage: listEmptyMessage,
        },
        data() {
            return {
                newsListItems: [
                    {id: 0, title: "macOS", votes: 0},
                    {id: 1, title: "Linux", votes: 0},
                    {id: 2, title: "Windows", votes: 0}
                ]
            }
        }
    });

    expect(wrapperWithNonEmptyList.text()).not.toContain(listEmptyMessage);

    const wrapperWithEmptyList = shallowMount(App, {
        propsData: {
            listEmptyMessage: listEmptyMessage,
        },
        data() {
            return {
                newsListItems: []
            }
        }
    });

    expect(wrapperWithEmptyList.text()).toContain(listEmptyMessage);
});
