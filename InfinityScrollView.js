class InfinityScrollView {
    /**
     *Creates an instance of InfinityScrollView.
     * @date 2019-12-25
     * @param {HTMLElement} rootElement
     * @param {number} [viewportItemCount=20]
     * @param {number} [itemHeight=50]
     * @memberof InfinityScrollView
     */
    constructor (rootElement, itemHeight = 50,viewportHeight = window.innerHeight) {
        //父元素
        this.rootElement = rootElement
        //当前显示的总数据
        this.viewportItemArray = [];
        //当前显示的部分数据
        this.viewportLoadArray = []
        //全部的数据
        this.totalArray = [];
        //当前的序列
        this.currentIndex = 0;
        //渲染类型
        this.scrollType = {
            SCROLL_TOP : 'SCROLL_TOP',
            SCROLL_BOTTOM : 'SCROLL_BOTTOM'
        };
        //一个item的高度
        this.itemHeight = itemHeight;
        //视口的高度
        this.viewportHeight = viewportHeight;
        //可视的item数量
        this.viewportLoadCount = Math.ceil(this.viewportHeight / this.itemHeight) + 1;
        //一次渲染的条数
        this.viewportItemCount = this.viewportLoadCount * 2;
        //根元素padding-top的值
        this.rootPaddingTop = 0;
        //根元素padding-bottom的值
        this.rootPaddingBottom = 0;
        //初始化
        this.init();

    }

    /**
     * @description 初始化
     * @date 2019-12-25
     * @memberof InfinityScrollView
     */
    init () {
        this.totalArray = this.generateLongList();
        this.viewportItemArray = this.totalArray.slice(0,this.viewportItemCount);
        this.initElement(this.viewportItemArray);
        this.render(this.currentIndex);
        let firstElement = this.viewportItemArray[0];
        let lastElement = this.viewportItemArray[this.viewportItemArray.length - 1];
        this.observe(firstElement,lastElement)
    }
    /**
     * @description 生成一个长的列表
     * @date 2019-12-25
     * @returns 
     * @memberof InfinityScrollView
     */
    generateLongList() {
        let longList = [];
        let i = 0;
        while (i < 10000) {
            let element = document.createElement('div');
            element.className = 'item'
            longList.push(element)
            i++;
        }
        return longList;
    };

    /**
     * @description 观察元素
     * @date 2019-12-25
     * @param {*} firstElement
     * @param {*} lastElement
     * @memberof InfinityScrollView
     */
    observe (firstElement,lastElement) {
        const callback = (entries) => {
            if (entries.length > 1) {
                return;
            }
            entries.forEach((entry) => {
                if (entry.target.dataset.sIndex === firstElement.dataset.sIndex && entry.isIntersecting === true) {
                    // 当第一个元素进入视窗,加载上面的
                    if (this.currentIndex > 0) {
                        this.currentIndex -= 1;
                        this.render(this.currentIndex, this.scrollType.SCROLL_TOP)
                    }
                } else if (entry.target.dataset.sIndex === lastElement.dataset.sIndex && entry.isIntersecting === true) {
                    // 当最后一个元素进入视窗,加载下面的
                    let maxIndex = Math.floor(this.totalArray.length / this.viewportLoadCount)
                    if (this.currentIndex < maxIndex) {
                        this.currentIndex += 1;
                        this.render(this.currentIndex, this.scrollType.SCROLL_BOTTOM)
                    }
                }
            });
        };
        let observer = new IntersectionObserver(callback);
        // 观察列表第一个以及最后一个元素
        observer.observe(firstElement);
        observer.observe(lastElement);
    };

    /**
     * @description 渲染
     * @date 2019-12-25
     * @param {*} index
     * @param {*} scrollType
     * @memberof InfinityScrollView
     */
    render (index, scrollType) {
        if (index === -1 || index === Math.floor(this.totalArray.length / this.viewportLoadCount) + 1) {
            return;
        }
        this.viewportLoadArray = this.totalArray.slice(index * this.viewportLoadCount, (index + 1) * this.viewportLoadCount);
        if (scrollType === this.scrollType.SCROLL_BOTTOM) { 
            //向下滑动计算paddingTop和paddingBottom
            this.rootPaddingTop =  this.itemHeight * ((index - 1) * this.viewportLoadCount +  this.viewportLoadArray.length);
            let addPaddingTop = this.itemHeight * this.viewportLoadArray.length
            if (this.rootPaddingBottom - addPaddingTop >= 0) {
                this.rootPaddingBottom = this.rootPaddingBottom - addPaddingTop;
            }
        } else if (scrollType === this.scrollType.SCROLL_TOP){
            //向上滑动计算paddingTop和paddingBottom
            let prePaddingTop = this.rootElement.style.paddingTop;
            this.rootPaddingTop =  this.itemHeight * ((index - 1) * this.viewportLoadCount +  this.viewportLoadArray.length);
            let minusPaddingTop =  this.rootPaddingTop - parseInt(prePaddingTop.replace('px',''));
            let prePaddingBottom = this.rootElement.style.paddingBottom ? parseInt(this.rootElement.style.paddingBottom.replace('px','')) : 0;
            this.rootPaddingBottom = prePaddingBottom + Math.abs(minusPaddingTop);
        }
        this.rootElement.style.paddingTop = this.rootPaddingTop + 'px';
        this.rootElement.style.paddingBottom = this.rootPaddingBottom + 'px'
        let len = this.rootElement.childElementCount - 1;
        while (len >= 0) {
            this.rootElement.children[len].innerText = index * this.viewportLoadCount + len;
            len--;
        }
    };

    /**
     * @description
     * @date 2019-12-25
     * @param {[HTMLElement]} elements
     * @memberof InfinityScrollView
     */
    initElement (elements) {
        elements.forEach((element, index) => {
            element.dataset.sIndex = index;
            this.rootElement.appendChild(element)
        })
    }
}


let element = document.getElementById('root')
let scrollView = new InfinityScrollView(element);
