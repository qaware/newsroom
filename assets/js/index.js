(function () {

    const doc = document.documentElement;

    function createEl(element) {
        return document.createElement(element);
    }

    function elem(selector) {
        let elem = document.querySelector(selector);
        return elem != false ? elem : false;
    }

    function elems(selector, parent = document) {
        let elems = parent.querySelectorAll(selector);
        return elems.length ? elems : false;
    }

    function pushClass(el, targetClass) {
        // equivalent to addClass
        if (el && typeof el == 'object' && targetClass) {
            elClass = el.classList;
            elClass.contains(targetClass) ? false : elClass.add(targetClass);
        }
    }

    function deleteClass(el, targetClass) {
        // equivalent to removeClass
        if (el && typeof el == 'object' && targetClass) {
            elClass = el.classList;
            elClass.contains(targetClass) ? elClass.remove(targetClass) : false;
        }
    }

    function modifyClass(el, targetClass) {
        if (el && typeof el == 'object' && targetClass) {
            elClass = el.classList;
            elClass.contains(targetClass) ? elClass.remove(targetClass) : elClass.add(targetClass);
        }
    }

    function containsClass(el, targetClass) {
        if (el && typeof el == 'object' && targetClass) {
            return el.classList.contains(targetClass) ? true : false;
        }
    }

    function isChild(node, parentClass) {
        let isNode = node && typeof node == 'object';
        if (isNode) {
            if (Array.isArray(parentClass)) {
                // return true if at least one is child
                let child = false;
                parentClass.forEach(function (parent) {
                    if (node.closest(parent) != null) {
                        child = true;
                    }
                });
                return child ? true : false;
            } else if (typeof parentClass == 'string') {
                return node.closest(parentClass) ? true : false;
            }
        }
    }

    function getStyleSheet(uniqueTitle) {
        for (let i=0; i<document.styleSheets.length; i++) {
            const sheet = document.styleSheets[i];
            if (sheet.title === uniqueTitle) {
                return sheet;
            }
        }
    }

    (function updateDate() {
        const dateElem = elem('.year')
        if (dateElem) {
            const date = new Date();
            const year = date.getFullYear();
            dateElem.innerHTML = year;
        }
    })();

    (function () {
        let mainStyleSheetTitle = 'templateStyle';
        let navIconIdentifier = 'mobile-nav-icon-link';
        const mobileMenuIdentifier = 'mobile-nav';
        const mobileMenuClass = 'mobile-nav';
        const navIcon = document.getElementById(navIconIdentifier);
        let mobileMenu = document.getElementById(mobileMenuIdentifier)
        let hiddenClass = 'collapsed'
        let openClass = 'open'

        function toggleMobileMenu() {
            modifyClass(mobileMenu, hiddenClass)
            modifyClass(navIcon, openClass)
        }

        navIcon.addEventListener('click', function () {
            toggleMobileMenu();
        })

        const styleSheet = getStyleSheet(mainStyleSheetTitle);
        if (!styleSheet) {
            console.error("Could not find style sheet. Mobile menu might not work.");
            return;
        }
        const entriesHeight = document.getElementById(mobileMenuIdentifier).scrollHeight;
        const menuHeightRule = "." + mobileMenuClass + " { height: " + entriesHeight + "px; }";
        styleSheet.insertRule(menuHeightRule,0);

    })();

    (function share() {
        let share = elem('.share');
        let open = 'share-open';
        let close = 'share-close';
        let button = elem('.share-trigger');

        function showShare() {
            pushClass(share, open);
            deleteClass(share, close);
        }

        function hideShare() {
            pushClass(share, open);
            deleteClass(share, close);
        }

        if (button) {
            button.addEventListener('click', function () {
                showShare();
                setTimeout(hideShare, 5000);
            });
        }
    })();

    function elemAttribute(elem, attr, value = null) {
        if (value) {
            elem.setAttribute(attr, value);
        } else {
            value = elem.getAttribute(attr);
            return value ? value : false;
        }
    }

    (function () {
        let links = document.querySelectorAll('a');
        if (links) {
            Array.from(links).forEach(function (link) {
                let target, rel, blank, noopener, attr1, attr2, url, isExternal;
                url = elemAttribute(link, 'href');
                isExternal = (url && typeof url == 'string' && url.startsWith('http')) && !containsClass(link, 'nav-item') && !isChild(link, ['.archive', '.article', '.post_nav', '.pager']) ? true : false;
                if (isExternal) {
                    target = 'target';
                    rel = 'rel';
                    blank = '_blank';
                    noopener = 'noopener';
                    attr1 = elemAttribute(link, target);
                    attr2 = elemAttribute(link, noopener);

                    attr1 ? false : elemAttribute(link, target, blank);
                    attr2 ? false : elemAttribute(link, rel, noopener);
                }
            });
        }
    })();

    let headingNodes = [], results, link, icon, current, id,
        tags = ['h2', 'h3', 'h4', 'h5', 'h6'];


    current = document.URL;

    tags.forEach(function (tag) {
        results = document.getElementsByTagName(tag);
        Array.prototype.push.apply(headingNodes, results);
    });

    headingNodes.forEach(function (node) {
        link = createEl('a');
        icon = createEl('img');
        icon.className = 'icon';
        icon.src = '{{ "images/icons/link.svg" | absURL }}';
        link.className = 'link';
        link.appendChild(icon);
        id = node.getAttribute('id');
        if (id) {
            link.href = `${current}#${id}`;
            node.appendChild(link);
            pushClass(node, 'link_owner');
        }
    });

    const copyToClipboard = str => {
        // Create a <textarea> element
        const el = createEl('textarea');
        // Set its value to the string that you want copied
        el.value = str;
        // Make it readonly to be tamper-proof
        el.setAttribute('readonly', '');
        // Move outside the screen to make it invisible
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        // Append the <textarea> element to the HTML document
        document.body.appendChild(el);
        // Check if there is any content selected previously
        const selected =
            document.getSelection().rangeCount > 0
                ? document.getSelection().getRangeAt(0)   // Store selection if found
                : false;                                  // Mark as false to know no selection existed before
        el.select();                              // Select the <textarea> content
        document.execCommand('copy'); // Copy - only works as a result of a user action (e.g. click events)
        document.body.removeChild(el);                  // Remove the <textarea> element
        if (selected) {                                 // If a selection existed before copying
            document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
            document.getSelection().addRange(selected);   // Restore the original selection
        }
    };

    (function copyHeadingLink() {
        let deeplink = 'link';
        let deeplinks = document.querySelectorAll(`.${deeplink}`);
        if (deeplinks) {
            document.body.addEventListener('click', function (event) {
                let target = event.target;
                if (target.classList.contains(deeplink) || target.parentNode.classList.contains(deeplink)) {
                    event.preventDefault();
                    let newLink = target.href != undefined ? target.href : target.parentNode.href;
                    copyToClipboard(newLink);
                }
            });
        }
    })();

    (function copyLinkToShare() {
        let copy, copied, excerpt, isCopyIcon, isInExcerpt, link, page, postCopy, postLink, target;
        copy = 'copy';
        copied = 'copy_done';
        excerpt = 'excerpt';
        postCopy = 'post_copy';
        postLink = 'post_card';
        page = document.documentElement;

        page.addEventListener('click', function (event) {
            target = event.target;
            isCopyIcon = containsClass(target, copy);
            isInExcerpt = containsClass(target, postCopy);
            if (isCopyIcon) {
                if (isInExcerpt) {
                    link = target.closest(`.${excerpt}`).previousElementSibling;
                    link = containsClass(link, postLink) ? elemAttribute(link, 'href') : false;
                } else {
                    link = window.location.href;
                }
                if (link) {
                    copyToClipboard(link);
                    pushClass(target, copied);
                }
            }
        });
    })();

    (function hideAside() {
        let aside, title, posts;
        aside = elem('.aside');
        title = aside ? aside.previousElementSibling : null;
        if (aside && title.nodeName.toLowerCase() === 'h3') {
            posts = Array.from(aside.children);
            posts.length < 1 ? title.remove() : false;
        }
    })();

    (function goBack() {
        let backBtn = elem('.btn_back');
        let history = window.history;
        if (backBtn) {
            backBtn.addEventListener('click', function () {
                history.back();
            });
        }
    })();

})();
