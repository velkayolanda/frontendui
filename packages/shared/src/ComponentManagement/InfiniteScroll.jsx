import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { ErrorHandler, LoadingSpinner } from "../Components";

const mergeArraysById = (array1, array2) => {
    const mergedMap = new Map();

    // Add items from the first array
    array1.forEach((item) => {
        mergedMap.set(item.id, item);
    });

    // Add items from the second array (overwrites if id already exists)
    array2.forEach((item) => {
        mergedMap.set(item.id, item);
    });

    // Convert the Map back to an array
    return Array.from(mergedMap.values());
};

/**
 * InfiniteScroll Component
 *
 * A reusable component that provides infinite scrolling functionality. 
 * It dynamically fetches and appends items to the list as the user scrolls to the end.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Array<Object>} [props.preloadedItems=[]] - An optional array of preloaded items to display initially.
 * @param {Object} props.actionParams - Initial parameters for the async action, including pagination details.
 * @param {number} props.actionParams.skip - Initial skip value for pagination.
 * @param {number} props.actionParams.limit - Number of items to fetch per page.
 * @param {Object} [props.actionParams.otherParams] - Additional parameters to pass to the async action.
 * @param {Function} props.asyncAction - An asynchronous function or Redux action used to fetch more data.
 *   This function must return a promise that resolves to an array of fetched items.
 * @param {React.ComponentType} props.Visualiser - A component responsible for visualizing the fetched data.
 *   It receives the fetched items as a prop `items` and renders them.
 * @param {Function} [props.calculateNewFilter] - A function to calculate the new filter (pagination params) 
 *   after fetching more items. Defaults to incrementing `skip` and maintaining `limit`.
 *   @param {Object} oldFilter - The previous filter object.
 *   @returns {Object} A new filter object.
 * @param {React.ReactNode} [props.children] - Optional child components to pass to the `Visualiser`.
 * @param {...any} props - Additional props passed to the `Visualiser` component.
 *
 * @returns {JSX.Element} The rendered infinite scroll component.
 *
 * @example
 * // Redux action to fetch items
 * const fetchItems = ({ skip, limit }) => async (dispatch) => {
 *   const response = await fetch(`/api/items?skip=${skip}&limit=${limit}`);
 *   const result = await response.json();
 *   return result.items;
 * };
 *
 * // Visualizer Component
 * const ItemsVisualizer = ({ items }) => (
 *   <ul>
 *     {items.map((item) => (
 *       <li key={item.id}>{item.name}</li>
 *     ))}
 *   </ul>
 * );
 *
 * // Usage
 * <InfiniteScroll
 *   preloadedItems={[{ id: 1, name: "Item 1" }, { id: 2, name: "Item 2" }]}
 *   actionParams={{ skip: 0, limit: 10 }}
 *   asyncAction={fetchItems}
 *   Visualiser={ItemsVisualizer}
 *   calculateNewFilter={(oldFilter) => ({ ...oldFilter, skip: oldFilter.skip + 10 })}
 * />
 */
export const InfiniteScroll = ({ 
    preloadedItems, 
    actionParams, 
    asyncAction, 
    Visualiser,
    calculateNewFilter = (oldfilter) => ({...oldfilter, skip: (oldfilter.skip || 0) + (oldfilter.limit || 10), limit: oldfilter.limit || 10}),
    children,
    onAll = () => null,
    ...props
 }) => {
    // const { 
    //     skip=0, 
    //     limit=12, 
    //     ...otherParams 
    // } = actionParams;
    // console.log("actionParams", actionParams)
    const [_state, _setState] = useState({
        filter: {
            ...actionParams
        },
        // skip: skip,
        // limit: limit,
        loading: false,
        hasMore: true,
        errors: null,
        results: preloadedItems
    });

    const containerRef = useRef(null);
    const dispatch = useDispatch();

    // preloaded (store content) have changed, so take them as loaded
    useEffect(() => {
        if (_state.hasMore) return
        _setState(prevState => {
            // const items = mergeArraysById(_state.results, preloadedItems)
            const newState = ({
                ...prevState,
                results: preloadedItems,
                // filter: {...actionParams},
                // hasMore: true
            })
            return newState
        })
    },[preloadedItems])

    // Function to load more items
    const loadItems = async () => {
        if (_state.loading || !_state.hasMore) return;

        _setState({ ..._state, loading: true });
        try {
            const params = _state.filter;
            // console.log("going to fetch more", JSON.stringify(params))
            let fetchedResults = await dispatch(asyncAction(params));
            // console.log("fetchedResults", JSON.stringify(fetchedResults))
            fetchedResults = Object.values(fetchedResults?.data)?.[0]
            if (!Array.isArray(fetchedResults)) {
                fetchedResults = Object.values(fetchedResults).find(v => Array.isArray(v)) || [];
            }
            // console.log("fetchedResults", params.skip, params.limit)
            // console.log("fetchedResults JS", JSON.stringify(fetchedResults))

            if (fetchedResults.length == 0 ) {
                onAll()
                _setState(_state =>({
                    ..._state,
                    // results: mergeArraysById(_state.results, fetchedResults || []),
                    // skip: _state.skip + _state.limit,
                    hasMore: false,
                    loading: false
                }));
            } else {
                const newfilter = calculateNewFilter(_state.filter)
                _setState(_state => ({
                    ..._state,
                    filter: newfilter,
                    results: mergeArraysById(_state.results, fetchedResults || []),
                    // skip: _state.skip + _state.limit,
                    hasMore: true,
                    loading: false
                }));
            }
        } catch (error) {
            console.error("Error loading items:", error);
            _setState(_state => ({
                ..._state, 
                hasMore: false, 
                loading: false, 
                errors: error
            }));
        }
    };

    // Intersection Observer to detect when the user scrolls to the bottom
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && _state.hasMore && !_state.loading) {
                    loadItems()
                }
            },
            { threshold: 0 }
        );

        const containerRefCurrent = containerRef.current;
        if (containerRefCurrent) {
            observer.observe(containerRefCurrent);
        }

        return () => {
            if (containerRefCurrent) {
                observer.disconnect();
            }
        };
    }, [_state.hasMore, _state.loading, containerRef.current]);

    // if (_state.errors) return <ErrorHandler errors={_state.errors} />
    if (_state.results)
        return (
            <>
                <Visualiser items={_state.results} {...props}>
                    {children}
                </Visualiser>
                {/* {JSON.stringify(_state)} */}
                {/* {!_state.hasMore && <div>Více toho není.</div>} */}
                {/* {_state.errors && <ErrorHandler errors={_state.errors} />} */}
                {_state.errors && <ErrorHandler errors={_state.errors} />}
                {_state.loading && <LoadingSpinner text="Nahrávám další..."/>}
                {_state.hasMore && <div ref={containerRef} style={{ height: "50px", _backgroundColor: "#7F0000" }} />}
            </>
        );
};
